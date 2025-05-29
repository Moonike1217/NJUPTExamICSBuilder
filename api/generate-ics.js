const { createEvents } = require('ics');

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

  // 从表单数据中解析考试信息
  let examData;
  
  try {
    // 尝试从请求体的examData字段获取数据
    if (typeof req.body.examData === 'string') {
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
  
  try {
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

    const { error, value } = createEvents(events);
    
    if (error) {
      console.error('生成ICS文件失败:', error);
      return res.status(500).json({ error: '生成ICS文件失败' });
    }
    
    // 设置响应头，让浏览器将响应作为文件下载
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=exams.ics');
    
    // 直接将ICS内容发送到客户端
    res.send(value);
  } catch (error) {
    console.error('生成ICS文件时出错:', error);
    return res.status(500).json({ error: '生成ICS文件失败' });
  }
}; 