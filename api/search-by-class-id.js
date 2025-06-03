const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 全局变量存储Excel文件路径
const excelFilePath = path.join(process.cwd(), 'public', 'excel', '考试安排表.xlsx');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  const { classId, examData } = req.body;
  
  // 验证行政班格式
  const classIdRegex = /^[BQFP][0-9]{6}$/;
  if (!classIdRegex.test(classId)) {
    return res.status(400).json({ error: '行政班ID格式不正确，请重新检查！' });
  }
  
  try {
    let workbook;
    
    // 检查是否有微信小程序传来的文件数据
    if (examData && examData.fileData) {
      // 处理Base64文件数据（微信小程序）
      const buffer = Buffer.from(examData.fileData, 'base64');
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } else {
      // 检查本地Excel文件是否存在（Web版本）
      if (!fs.existsSync(excelFilePath)) {
        return res.status(400).json({ error: '考试安排表不存在，请上传Excel文件或联系管理员' });
      }
      // 读取本地Excel文件
      workbook = XLSX.readFile(excelFilePath);
    }
    
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
        if (key.includes('人数')) headers.studentCountColumn = key;
      }
    }
    
    console.log('检测到的表头:', headers);
    
    // 查找行政班ID对应的班级    
    const classPrefix = classId;
    
    // 过滤得到行政班的考试信息
    const examDataFiltered = rawData.filter(row => {
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
    
    if (examDataFiltered.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该行政班ID对应的考试信息',
        error: '未找到该行政班ID对应的考试信息' 
      });
    }
    
    // 转换为前端需要的格式
    const formattedExams = examDataFiltered.map(exam => {
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
        course: exam[headers.courseNameColumn] || '',
        courseName: exam[headers.courseNameColumn] || '', // 保持兼容性
        teacher: exam[headers.teacherColumn] || '',
        date: date,
        time: date && startTime && endTime ? `${date} ${startTime}-${endTime}` : examTimeText,
        startTime: startTime,
        endTime: endTime,
        location: exam[headers.examRoomColumn] || '',
        studentCount: exam[headers.studentCountColumn] || '',
        classId: classId
      };
    });
    
    res.json({ 
      success: true, 
      data: formattedExams,
      examData: formattedExams // 保持兼容性
    });
  } catch (error) {
    console.error('查询考试信息失败:', error);
    return res.status(500).json({ 
      success: false,
      message: '查询考试信息失败，请重试',
      error: '查询考试信息失败，请重试' 
    });
  }
}; 