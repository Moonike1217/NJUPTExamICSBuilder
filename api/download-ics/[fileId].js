module.exports = async (req, res) => {
  const { fileId } = req.query;

  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET请求' });
  }

  try {
    // 从存储中获取ICS文件内容
    const icsContent = await getICSContent(fileId);
    
    if (!icsContent) {
      return res.status(404).json({ error: '文件不存在或已过期' });
    }

    // 设置响应头，让浏览器将响应作为文件下载
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=exams.ics');
    
    // 发送文件内容
    res.send(icsContent);
    
  } catch (error) {
    console.error('下载文件时出错:', error);
    return res.status(500).json({ error: '下载文件失败' });
  }
}; 