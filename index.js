const express = require('express');
const bodyParser = require('body-parser');
const { createEvents } = require('ics');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 全局变量存储Excel文件路径
const excelFilePath = process.env.VERCEL
  ? path.join('/tmp', '考试安排表.xlsx')
  : path.join(__dirname, 'public', 'excel', '考试安排表.xlsx');

// 如果在Vercel环境中，将Excel文件从public目录复制到/tmp
if (process.env.VERCEL) {
  try {
    const sourceExcelPath = path.join(__dirname, 'public', 'excel', '考试安排表.xlsx');
    // 确保/tmp目录存在
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp', { recursive: true });
    }
    // 复制文件
    if (fs.existsSync(sourceExcelPath)) {
      fs.copyFileSync(sourceExcelPath, excelFilePath);
      console.log(`Excel文件已复制到: ${excelFilePath}`);
    } else {
      console.error(`源Excel文件不存在: ${sourceExcelPath}`);
    }
  } catch (error) {
    console.error('复制Excel文件失败:', error);
  }
}

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 根据教学班ID查询考试信息
app.post('/search-by-class-id', (req, res) => {
  const { classId } = req.body;
  
  // 验证行政班格式
  const classIdRegex = /^[BQF][0-9]{6}$/;
  if (!classIdRegex.test(classId)) {
    return res.status(400).json({ error: '行政班ID格式不正确，请重新检查！' });
  }
  
  // 检查Excel文件是否存在
  if (!fs.existsSync(excelFilePath)) {
    return res.status(400).json({ error: '考试安排表不存在，请联系管理员' });
  }
  
  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 设置解析选项，跳过第一行（标题行）
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    
    // 获取表头信息
    const headers = {};
    let headerRow = {};
    if (rawData.length > 0) {
      headerRow = rawData[0];
      // 查找考试相关列的索引
      for (const key in headerRow) {
        if (key.includes('班级')) headers.classColumn = key;
        if (key.includes('考试时间')) headers.examTimeColumn = key;
        if (key.includes('考试地点')) headers.examRoomColumn = key;
        if (key.includes('课程名称')) headers.courseNameColumn = key;
        if (key.includes('任课教师')) headers.teacherColumn = key;
      }
    }
    
    console.log('检测到的表头:', headers);
    
    // 查找行政班ID对应的班级    
    const classPrefix = classId;
    
    // 过滤得到行政班的考试信息
    const examData = rawData.filter(row => {
      // 尝试匹配班级列
      if (headers.classColumn && row[headers.classColumn]) {
        return row[headers.classColumn].toString().includes(classPrefix);
      }
      // 如果没有匹配到班级列，尝试匹配其他可能包含班级信息的列
      for (const key in row) {
        if (typeof row[key] === 'string' && row[key].includes(classPrefix)) {
          return true;
        }
      }
      return false;
    });
    
    if (examData.length === 0) {
      return res.status(404).json({ error: '未找到该行政班ID对应的考试信息' });
    }
    
    // 转换为前端需要的格式
    const formattedExams = examData.map(exam => {
      // 解析考试时间格式，支持多种格式：
      // 1. 第10周周3(2025-04-23) 13:30-15:20
      // 2. 2025年05月10日 (10:25-12:15)
      const examTimeText = exam[headers.examTimeColumn] || '';
      let date = '';
      let startTime = '';
      let endTime = '';
      
      if (examTimeText) {
        // 尝试匹配格式1：提取括号内的日期(YYYY-MM-DD)
        let dateMatch = examTimeText.match(/\((\d{4}-\d{2}-\d{2})\)/);
        if (dateMatch && dateMatch[1]) {
          date = dateMatch[1];
        } else {
          // 尝试匹配格式2：YYYY年MM月DD日
          dateMatch = examTimeText.match(/(\d{4})年(\d{2})月(\d{2})日/);
          if (dateMatch && dateMatch.length >= 4) {
            date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
          }
        }
        
        // 提取时间部分，匹配HH:MM-HH:MM格式
        const timeMatch = examTimeText.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
        if (timeMatch && timeMatch.length >= 3) {
          // 确保时间格式为两位数的小时
          startTime = timeMatch[1].includes(':') ? 
            (timeMatch[1].length === 4 ? '0' + timeMatch[1] : timeMatch[1]) : 
            timeMatch[1] + ':00';
          
          endTime = timeMatch[2].includes(':') ? 
            (timeMatch[2].length === 4 ? '0' + timeMatch[2] : timeMatch[2]) : 
            timeMatch[2] + ':00';
        }
      }
      
      return {
        courseName: exam[headers.courseNameColumn] || '',
        teacher: exam[headers.teacherColumn] || '',
        date: date,
        startTime: startTime,
        endTime: endTime,
        location: exam[headers.examRoomColumn] || ''
      };
    });
    
    res.json({ success: true, examData: formattedExams });
  } catch (error) {
    console.error('查询考试信息失败:', error);
    return res.status(500).json({ error: '查询考试信息失败，请重试' });
  }
});

// 辅助函数：格式化Excel中的日期
function formatExcelDate(excelDate) {
  // Excel日期是从1900年1月1日开始的天数
  // 如果已经是字符串格式如"2023-05-15"则直接返回
  if (typeof excelDate === 'string' && excelDate.includes('-')) {
    return excelDate;
  }
  
  // 如果是数字，将其转换为JS日期
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000); // 转换公式
    return date.toISOString().split('T')[0]; // 返回YYYY-MM-DD格式
  }
  
  // 如果是Date对象
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }
  
  return '';
}

// 接收考试数据并生成ICS文件
app.post('/generate-ics', (req, res) => {
  // 从表单数据中解析考试信息
  let examData;
  
  try {
    // 尝试从请求体的examData字段获取数据
    if (req.body.examData) {
      examData = JSON.parse(req.body.examData);
    } else {
      examData = req.body.examData;
    }
  } catch (error) {
    console.error('解析考试数据出错:', error);
    return res.status(400).json({ error: '考试数据解析失败' });
  }
  
  if (!examData || !Array.isArray(examData) || examData.length === 0) {
    return res.status(400).json({ error: '考试数据格式错误' });
  }
  
  // 检测用户代理，判断是否为移动设备
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
  
  console.log(`用户设备检测: Mobile=${isMobile}, Safari=${isSafari}, iOS=${isIOS}`);
  
  const events = examData.map(exam => {
    // 解析日期和时间
    const [year, month, day] = exam.date.split('-').map(Number);
    const [startHour, startMinute] = exam.startTime.split(':').map(Number);
    const [endHour, endMinute] = exam.endTime.split(':').map(Number);
    
    return {
      title: `考试 ${exam.courseName}`,
      description: `课程: ${exam.courseName}\n任课教师: ${exam.teacher || '未知'}\n考试地点: ${exam.location || '未知'}`,
      location: exam.location || '未知地点',
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      busyStatus: 'BUSY',
      productId: 'NJUPT-ExamCalendar/ICS',
      calName: '南邮考试日历',
      categories: ['考试'],
      // 确保有效的闹钟设置
      alarms: [
        {
          action: 'DISPLAY',
          description: `${exam.courseName}考试将在60分钟后开始，考试地点：${exam.location || '未知地点'}`,
          trigger: { minutes: 60, before: true }
        }
      ]
    };
  });
  
  createEvents(events, (error, value) => {
    if (error) {
      console.error('生成ICS错误:', error);
      return res.status(500).json({ error: '生成ICS文件失败' });
    }
    
    // 手动添加时区信息
    // 在VCALENDAR开始后、第一个VEVENT前添加VTIMEZONE组件
    const vtimezone = `VTIMEZONE
TZID:Asia/Shanghai
X-LIC-LOCATION:Asia/Shanghai
BEGIN:STANDARD
TZOFFSETFROM:+0800
TZOFFSETTO:+0800
TZNAME:CST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`;

    // 检查生成的ICS内容
    let icsContent = value;
    
    // 在第一个BEGIN:VEVENT前插入VTIMEZONE
    icsContent = icsContent.replace(
      'BEGIN:VEVENT',
      `${vtimezone}\nBEGIN:VEVENT`
    );
    
    // 为每个事件添加时区ID
    icsContent = icsContent.replace(/DTSTART:/g, 'DTSTART;TZID=Asia/Shanghai:');
    icsContent = icsContent.replace(/DTEND:/g, 'DTEND;TZID=Asia/Shanghai:');
    
    // 修复潜在的ICS格式问题
    // 确保每行不超过75个字符
    icsContent = icsContent.split('\n').map(line => {
      if (line.length > 75) {
        // 拆分长行，确保遵循RFC 5545规范
        const chunks = [];
        for (let i = 0; i < line.length; i += 74) {
          if (i === 0) {
            chunks.push(line.substring(i, i + 74));
          } else {
            chunks.push(' ' + line.substring(i, i + 74));
          }
        }
        return chunks.join('\n');
      }
      return line;
    }).join('\n');
    
    // 针对iOS设备优化
    if (isIOS) {
      // 确保按iOS日历需要的方式设置PRODID
      icsContent = icsContent.replace(
        /PRODID:.+/,
        'PRODID:-//南邮考试日历//ICS Calendar 1.0//CN'
      );
      
      // 确保事件有UID
      if (!icsContent.includes('UID:')) {
        const uids = events.map(() => `UID:${Date.now()}-${Math.random().toString(36).substring(2, 10)}@njupt.edu.cn`);
        icsContent = icsContent.replace(
          /BEGIN:VEVENT/g, 
          (match, index) => `BEGIN:VEVENT\n${uids[Math.min(index, uids.length - 1)]}`
        );
      }
    }
    
    console.log('ICS文件生成完成，大小:', Buffer.byteLength(icsContent, 'utf8'), '字节');
    
    // 设置响应头
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    
    // 根据设备类型设置不同的Content-Disposition
    if (isMobile && isSafari) {
      // 移动设备Safari不使用附件模式，直接呈现内容以便用户添加到日历
      res.setHeader('Content-Disposition', 'inline; filename="exams.ics"');
    } else {
      // 其他浏览器使用附件模式下载
      res.setHeader('Content-Disposition', 'attachment; filename="exams.ics"');
    }
    
    // 添加其他必要的响应头
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Length', Buffer.byteLength(icsContent, 'utf8'));
    
    // 发送ICS内容
    res.send(icsContent);
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`当前环境: ${process.env.VERCEL ? 'Vercel' : '本地'}`);
  console.log(`Excel文件路径: ${excelFilePath}`);
  
  // 检查Excel文件是否存在
  if (fs.existsSync(excelFilePath)) {
    console.log(`考试安排表已就绪: ${excelFilePath}`);
    try {
      // 尝试读取Excel文件以验证其有效性
      const workbook = XLSX.readFile(excelFilePath);
      const sheetName = workbook.SheetNames[0];
      console.log(`Excel文件验证成功，工作表: ${sheetName}`);
    } catch (error) {
      console.error('Excel文件读取失败:', error);
    }
  } else {
    console.error(`错误: 考试安排表文件不存在: ${excelFilePath}`);
    console.error('请确保Excel文件存在于正确路径');
  }
}); 