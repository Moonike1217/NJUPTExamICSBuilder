const XLSX = require('xlsx');
const path = require('path');
const { createEvents } = require('ics');
const { nanoid } = require('nanoid');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

// 表头映射
const HEADERS = {
  courseNameColumn: '课程名称',
  classColumn: '班级名称',
  teacherColumn: '任课教师',
  examTimeColumn: '考试时间',
  examRoomColumn: '考试地点'
};

// 读取Excel文件
function readExcelFile() {
  const excelPath = path.join(process.cwd(), 'public', 'excel', '考试安排表.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

// 解析考试时间
function parseExamTime(timeStr) {
  const date = dayjs.tz(timeStr, 'Asia/Shanghai');
  return {
    start: [
      date.year(),
      date.month() + 1,
      date.date(),
      date.hour(),
      date.minute()
    ],
    end: [
      date.year(),
      date.month() + 1,
      date.date(),
      date.hour() + 2,
      date.minute()
    ]
  };
}

// 生成ICS事件
function generateEvent(exam) {
  const time = parseExamTime(exam[HEADERS.examTimeColumn]);
  return {
    productId: 'adamgibbons/ics',
    method: 'PUBLISH',
    title: `考试 ${exam[HEADERS.courseNameColumn]}`,
    description: `课程: ${exam[HEADERS.courseNameColumn]}\n任课教师: ${exam[HEADERS.teacherColumn]}\n考试地点: ${exam[HEADERS.examRoomColumn]}`,
    location: exam[HEADERS.examRoomColumn],
    start: time.start,
    end: time.end,
    startInputType: 'local',
    endInputType: 'local',
    startOutputType: 'local',
    endOutputType: 'local',
    categories: ['考试'],
    alarms: [{
      action: 'display',
      trigger: { hours: 24, before: true },
      description: '考试提醒'
    }],
    uid: nanoid()
  };
}

// API处理函数
module.exports = async (req, res) => {
  try {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: '请提供班级ID' });
    }

    // 读取Excel数据
    const exams = readExcelFile();
    
    // 过滤指定班级的考试
    const classExams = exams.filter(exam => 
      exam[HEADERS.classColumn].includes(classId)
    );

    if (classExams.length === 0) {
      return res.status(404).json({ error: '未找到该班级的考试信息' });
    }

    // 生成ICS文件
    const events = classExams.map(generateEvent);
    const { error, value } = createEvents(events);

    if (error) {
      console.error('生成ICS文件时出错:', error);
      return res.status(500).json({ error: '生成ICS文件失败' });
    }

    // 设置响应头
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="exam_schedule_${classId}.ics"`);
    
    // 返回ICS文件内容
    res.status(200).send(value);
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}; 