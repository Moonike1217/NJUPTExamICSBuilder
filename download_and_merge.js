#!/usr/bin/env node
const XLSX = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PAGE_URL = 'https://jwc.njupt.edu.cn/_t278/2026/0521/c1594a302369/page.htm';
const OUTPUT_FILE = 'public/excel/考试安排表.xlsx';
const TITLE = '2025-2026学年第二学期考试安排表';
const TARGET_HEADERS = ['校区', '开课学院', '课程代码', '课程名称', '班级名称', '任课教师', '人数', '考试时间', '考试地点'];

const COL_MAP_12 = {
  '校区': '校区', '开课学院': '开课学院', '课程代码': '课程代码',
  '课程名称': '课程名称', '班级名称': '班级名称', '任课教师': '任课教师',
  '人数': '人数', '考试时间': '考试时间', '教室名称': '考试地点',
};
const COL_MAP_9 = {
  '校区': '校区', '开课学院': '开课学院', '课程代码': '课程代码',
  '课程名称': '课程名称', '班级名称': '班级名称', '任课教师': '任课教师',
  '人数': '人数', '考试时间': '考试时间', '考试教室': '考试地点',
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.rejectUnauthorized = false;
    opts.headers = { 'User-Agent': 'Mozilla/5.0 (compatible; NJUPTExamICSBuilder/1.0)' };
    opts.timeout = 15000;

    https.get(opts, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject).on('timeout', function() {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function downloadList() {
  console.log('Fetching page...');
  const html = (await httpsGet(PAGE_URL)).toString('utf8');

  const links = [];
  const regex = /href="(\/_upload\/article\/files\/[^"]+\.xlsx)"[^>]*>([^<]+)\.xlsx/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ urlPath: match[1], name: match[2] + '.xlsx' });
  }

  if (links.length === 0) throw new Error('No xlsx links found on page');
  console.log(`Found ${links.length} attachment(s):`);

  const files = [];
  for (const link of links) {
    const fullUrl = `https://jwc.njupt.edu.cn${link.urlPath}`;
    console.log(`  Downloading: ${link.name}`);
    const data = await httpsGet(fullUrl);
    const tmpPath = `/tmp/${link.name}`;
    fs.writeFileSync(tmpPath, data);
    files.push(tmpPath);
    console.log(`    -> OK (${data.length} bytes)`);
  }
  return files;
}

function readRows(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

function detectColumnMap(headers) {
  const colMap = {};
  let match12 = 0, match9 = 0;
  for (const [src, tgt] of Object.entries(COL_MAP_12)) {
    const idx = headers.indexOf(src);
    if (idx !== -1) { colMap[tgt] = idx; match12++; }
  }
  for (const [src, tgt] of Object.entries(COL_MAP_9)) {
    const idx = headers.indexOf(src);
    if (idx !== -1) { colMap[tgt] = idx; match9++; }
  }
  if (match12 >= 9 || match9 >= 9) return colMap;
  throw new Error(`Unknown column structure. Headers: ${JSON.stringify(headers)}`);
}

function transformRows(rows) {
  const colMap = detectColumnMap(rows[0]);
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(c => c === '' || c == null)) continue;
    result.push(TARGET_HEADERS.map(h => {
      const idx = colMap[h];
      return idx !== undefined ? (row[idx] ?? '') : '';
    }));
  }
  return result;
}

async function main() {
  const files = await downloadList();

  console.log('\nMerging...');
  let allData = [];
  for (const file of files) {
    const rows = readRows(file);
    if (rows.length < 2) continue;
    const transformed = transformRows(rows);
    console.log(`  ${path.basename(file)}: ${transformed.length} rows`);
    allData.push(...transformed);
  }

  const wsData = [[TITLE], TARGET_HEADERS, ...allData];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = [{ s: { c: 0, r: 0 }, e: { c: 8, r: 0 } }];
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  XLSX.writeFile(wb, OUTPUT_FILE);

  for (const file of files) fs.unlinkSync(file);

  console.log(`\nDone. ${allData.length} total rows → ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
