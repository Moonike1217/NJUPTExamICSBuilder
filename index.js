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
const excelFilePath = path.join(__dirname, 'public', 'excel', '考试安排表.xlsx');

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
        if (key.includes('考试教室')) headers.examRoomColumn = key;
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
  
  const events = examData.map(exam => {
    // 解析日期和时间
    const [year, month, day] = exam.date.split('-').map(Number);
    const [startHour, startMinute] = exam.startTime.split(':').map(Number);
    const [endHour, endMinute] = exam.endTime.split(':').map(Number);
    
    return {
      title: `考试 ${exam.courseName}`,
      description: `课程: ${exam.courseName}\n任课教师: ${exam.teacher}\n考试地点: ${exam.location}`,
      location: exam.location,
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      categories: ['考试'],
      alarms: [
        {
          action: 'display',
          description: `${exam.courseName}考试将在60分钟后开始，考试地点：${exam.location}`,
          trigger: { minutes: 60, before: true }
        }
      ]
    };
  });
  
  createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: '生成ICS文件失败' });
    }
    
    // 设置响应头，让浏览器将响应作为文件下载
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=exams.ics');
    
    // 直接将ICS内容发送到客户端
    res.send(value);
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  
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
    console.error('请确保 public/excel 目录中存在 考试安排表.xlsx 文件');
  }
}); 