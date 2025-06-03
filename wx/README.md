# 南邮考试日历生成器 - 微信小程序版

这是南京邮电大学考试日历生成器的微信小程序版本，可以帮助学生将考试信息转换为标准的 ICS 日历文件。

## 功能特性

### 🎯 核心功能
- **考试信息查询**：通过学号快速查询个人考试安排
- **智能文件解析**：支持上传Excel考试文件，自动解析考试信息
- **日历文件生成**：生成标准ICS格式的日历文件
- **历史记录**：自动保存查询历史，方便快速重复使用
- **手动输入**：支持手动输入考试信息

### 📱 小程序特性
- **原生体验**：流畅的小程序交互体验
- **离线缓存**：考试数据本地缓存，无网络也能查看
- **分享功能**：支持分享考试安排给好友
- **实时同步**：与Vercel后端服务实时同步数据

## 技术架构

### 前端（微信小程序）
- **框架**：微信小程序原生框架
- **语言**：JavaScript + WXML + WXSS
- **工具库**：自定义工具函数

### 后端（Vercel Serverless）
- **平台**：Vercel Serverless Functions
- **运行时**：Node.js
- **文件处理**：XLSX库解析Excel文件
- **日历生成**：ICS库生成日历文件

## 项目结构

```
wx/
├── app.js                 # 小程序主应用逻辑
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── sitemap.json          # 小程序索引配置
├── project.config.json   # 微信开发者工具配置
├── utils/                # 工具函数
│   ├── api.js            # API调用封装
│   └── util.js           # 通用工具函数
├── pages/                # 页面文件
│   ├── index/            # 首页
│   │   ├── index.js
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── upload/           # 上传页面
│   │   ├── upload.js
│   │   ├── upload.wxml
│   │   └── upload.wxss
│   └── result/           # 结果页面
│       ├── result.js
│       ├── result.wxml
│       └── result.wxss
└── images/               # 图片资源
    ├── home.png
    ├── home_selected.png
    ├── upload.png
    ├── upload_selected.png
    └── logo.png
```

## 使用说明

### 1. 配置API地址
在 `app.js` 文件中，修改 `apiBaseUrl` 为您的Vercel部署地址：

```javascript
globalData: {
  apiBaseUrl: 'https://your-vercel-domain.vercel.app/api',
  // ...
}
```

### 2. 开发环境设置
1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 在微信开发者工具中导入项目（选择 `wx` 文件夹）
3. 配置AppID（在project.config.json中修改，或在开发者工具中设置）

### 3. 发布流程
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录[微信公众平台](https://mp.weixin.qq.com/)
4. 在版本管理中提交审核
5. 审核通过后发布

## 部署说明

### 后端部署（Vercel）
确保您的Vercel后端服务正常运行，API端点包括：
- `/api/search-by-class-id` - 查询考试信息
- `/api/generate-ics` - 生成ICS文件

### 小程序部署
1. 在微信公众平台注册小程序账号
2. 获取AppID并配置到project.config.json
3. 配置服务器域名（将您的Vercel域名添加到request合法域名）
4. 上传代码并提交审核

## 学号格式要求

支持的学号格式：
- **B开头**：本科生（如：B230001）
- **Q开头**：其他类型学生
- **P开头**：专科生
- **F开头**：其他类型学生

学号总长度必须为7位。

## 注意事项

### 小程序限制
1. **文件下载限制**：小程序无法直接下载文件，ICS内容会复制到剪贴板
2. **文件上传限制**：Excel文件会转换为Base64格式上传
3. **域名白名单**：需要在小程序后台配置API域名

### 隐私政策
- 考试数据仅用于生成日历文件
- 历史记录存储在本地，不上传到服务器
- 不收集用户个人信息

## 开发指南

### 添加新功能
1. 在对应的页面文件夹中修改js/wxml/wxss文件
2. 如需新增页面，在app.json中添加pages路径
3. 在utils文件夹中添加通用工具函数

### 调试技巧
1. 使用console.log在开发者工具中查看日志
2. 利用开发者工具的Network面板调试API调用
3. 使用Storage面板查看本地存储数据

## 许可证

ISC

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 邮件联系 