const express = require('express');
const bodyParser = require('body-parser');
const { createEvents } = require('ics');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, 'exams-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
      cb(null, true);
    } else {
      cb(new Error('请上传Excel文件'), false);
    }
  }
});

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 全局变量存储上传的Excel文件路径
let excelFilePath = '';

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 上传Excel文件
app.post('/upload-excel', upload.single('excelFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传Excel文件' });
  }
  
  excelFilePath = req.file.path;
  
  try {
    // 尝试读取Excel文件以验证其有效性
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    res.json({ success: true, message: 'Excel文件上传成功' });
  } catch (error) {
    console.error('Excel文件读取失败:', error);
    return res.status(400).json({ error: '无法读取Excel文件，请确保文件格式正确' });
  }
});

// 根据学号查询考试信息
app.post('/search-by-student-id', (req, res) => {
  const { studentId } = req.body;
  
  // 验证学号格式
  const studentIdRegex = /^[BQF][0-9]{8}$/;
  if (!studentIdRegex.test(studentId)) {
    return res.status(400).json({ error: '学号格式不正确，必须是B、Q或F开头，总长度为9位' });
  }
  
  // 检查是否已上传Excel文件
  if (!excelFilePath || !fs.existsSync(excelFilePath)) {
    return res.status(400).json({ error: '请先上传Excel文件' });
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
    
    // 查找学号对应的班级
    const studentClass = studentId.substring(0, 7); // 前7位表示班级
    
    // 过滤得到学生班级的考试信息
    const examData = rawData.filter(row => {
      // 尝试匹配班级列
      if (headers.classColumn && row[headers.classColumn]) {
        return row[headers.classColumn].toString().includes(studentClass);
      }
      // 如果没有匹配到班级列，尝试匹配其他可能包含班级信息的列
      for (const key in row) {
        if (typeof row[key] === 'string' && row[key].includes(studentClass)) {
          return true;
        }
      }
      return false;
    });
    
    if (examData.length === 0) {
      return res.status(404).json({ error: '未找到该学号对应的考试信息' });
    }
    
    // 转换为前端需要的格式
    const formattedExams = examData.map(exam => {
      // 解析考试时间格式：第10周周3(2025-04-23) 13:30-15:20
      const examTimeText = exam[headers.examTimeColumn] || '';
      let date = '';
      let startTime = '';
      let endTime = '';
      
      if (examTimeText) {
        // 提取日期部分，匹配括号内的内容
        const dateMatch = examTimeText.match(/\((\d{4}-\d{2}-\d{2})\)/);
        if (dateMatch && dateMatch[1]) {
          date = dateMatch[1];
        }
        
        // 提取时间部分，匹配HH:MM-HH:MM格式
        const timeMatch = examTimeText.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (timeMatch && timeMatch.length >= 3) {
          startTime = timeMatch[1];
          endTime = timeMatch[2];
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
  const { examData } = req.body;
  
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
    
    const filePath = path.join(__dirname, 'public', 'downloads', 'exams.ics');
    
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, value);
    
    res.json({ success: true, downloadUrl: '/downloads/exams.ics' });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 