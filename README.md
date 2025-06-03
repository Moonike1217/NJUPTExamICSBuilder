# 南邮考试日历生成器

这是一个帮助南京邮电大学学生将考试信息转换为 ICS 日历文件的工具，方便导入到各种日历应用。

**🎉 现已支持微信小程序版本！**

## 版本说明

### 🌐 Web版本
基于 Vercel 部署的 Web 应用，支持在线使用。

### 📱 微信小程序版本
原生微信小程序体验，支持文件上传、离线缓存等功能。
详细说明请查看：[wx/README.md](./wx/README.md)

## 功能

- 支持上传教务处发布的Excel考试文件
- 根据学号（B/Q/P/F开头）查询对应的考试信息
- 生成标准的 ICS 日历文件
- 提供友好的 Web 界面和微信小程序界面
- 可导入到 Google 日历、Apple 日历、Outlook 等各种日历应用

## 部署说明

### Vercel 部署

1. Fork 本项目到您的 GitHub
2. 在 Vercel 中导入该项目
3. 部署完成后即可使用

### 本地开发与调试

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 克隆项目后安装依赖：
```bash
npm install
```

3. 使用 Vercel CLI 进行本地开发：
```bash
vercel dev
```

启动后，打开浏览器访问 `http://localhost:3000` 即可使用。

### 微信小程序部署

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 在微信开发者工具中导入项目（选择 `wx` 文件夹）
3. 修改 `wx/app.js` 中的 `apiBaseUrl` 为您的 Vercel 部署地址
4. 在微信公众平台配置服务器域名（将您的Vercel域名添加到request合法域名）
5. 上传代码并提交审核

## 使用方法

### Web版本
1. 上传教务处考试安排Excel文件
2. 输入学号查询您的考试信息（B、Q、P或F开头，共7位）
3. 确认考试信息
4. 点击"生成日历文件"按钮
5. 下载生成的 ICS 文件
6. 将 ICS 文件导入到您的日历应用

### 微信小程序版本
1. 搜索或扫码进入小程序
2. 输入学号
3. 上传考试安排Excel文件或手动输入考试信息
4. 查看考试安排
5. 生成ICS内容并复制到剪贴板
6. 在电脑上保存为.ics文件并导入日历应用

## 学号格式要求

- 必须以字母 B、Q、P 或 F 开头
- 总长度必须为7位

## 项目结构

```
NJUPTExamICSBuilder/
├── api/                      # Serverless API 函数
│   ├── generate-ics.js       # 生成ICS文件的API
│   └── search-by-class-id.js # 考试信息查询API
├── public/                   # 静态文件（Web版本）
│   └── index.html            # 前端页面
├── wx/                       # 微信小程序版本
│   ├── app.js                # 小程序主应用逻辑
│   ├── app.json              # 小程序配置文件
│   ├── pages/                # 小程序页面
│   ├── utils/                # 小程序工具函数
│   └── README.md             # 小程序详细说明
├── vercel.json               # Vercel 配置文件
├── package.json              # 项目配置
└── README.md                 # 说明文档
```

## 技术栈

### 后端
- Node.js
- Vercel Serverless Functions
- XLSX (Excel解析)
- ICS (iCalendar 文件格式)

### 前端
- **Web版本**：HTML5 + JavaScript + Bootstrap 5
- **小程序版本**：微信小程序原生框架

## 特性对比

| 功能 | Web版本 | 小程序版本 |
|------|---------|------------|
| 考试信息查询 | ✅ | ✅ |
| Excel文件上传 | ✅ | ✅ |
| ICS文件生成 | ✅ | ✅ |
| 文件直接下载 | ✅ | ❌（复制到剪贴板）|
| 历史记录 | ❌ | ✅ |
| 离线缓存 | ❌ | ✅ |
| 分享功能 | ❌ | ✅ |
| 手动输入 | ❌ | ✅ |

## 更新日志

### v2.0.0 (微信小程序版本)
- 🎉 新增微信小程序版本
- 📱 支持原生小程序体验
- 💾 添加本地存储和历史记录功能
- 🔄 支持手动输入考试信息
- 📤 添加分享功能

### v1.0.0 (Web版本)
- 🌐 基础Web版本
- 📊 Excel文件解析
- 📅 ICS文件生成
- �� 学号查询功能

## 许可

ISC 