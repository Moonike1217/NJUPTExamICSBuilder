# 南邮考试日历生成器

这是一个帮助南京邮电大学学生将考试信息转换为 ICS 日历文件的工具，方便导入到各种日历应用。

## 功能

- 支持上传教务处发布的Excel考试文件
- 根据学号（B/Q/F开头）查询对应的考试信息
- 生成标准的 ICS 日历文件
- 提供友好的 Web 界面
- 可导入到 Google 日历、Apple 日历、Outlook 等各种日历应用

## 安装与使用

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
npm start
```

或者以开发模式启动（自动重启）：

```bash
npm run dev
```

启动后，打开浏览器访问 `http://localhost:3000` 即可使用。

## 使用方法

1. 上传教务处考试安排Excel文件
2. 输入学号查询您的考试信息（B、Q或F开头，共9位）
3. 确认考试信息
4. 点击"生成日历文件"按钮
5. 下载生成的 ICS 文件
6. 将 ICS 文件导入到您的日历应用

## 学号格式要求

- 必须以字母 B、Q 或 F 开头
- 总长度必须为9位

## 项目结构

```
NJUPTExamICSBuilder/
├── public/                 # 静态文件
│   ├── index.html          # 前端页面
│   ├── uploads/            # 上传的Excel文件
│   └── downloads/          # 生成的日历文件
├── index.js                # 服务器入口文件
├── package.json            # 项目配置
└── README.md               # 说明文档
```

## 技术栈

- Node.js
- Express.js
- XLSX (Excel解析)
- ICS (iCalendar 文件格式)
- Bootstrap 5

## 许可

ISC 