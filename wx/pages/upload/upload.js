const util = require('../../utils/util.js')
const apiService = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    classId: '',
    selectedFile: null,
    fileSize: '',
    fileStatus: '待上传',
    uploading: false,
    uploadProgress: 0,
    errorMessage: ''
  },

  onLoad(options) {
    const classId = options.classId || app.globalData.classId || ''
    this.setData({
      classId: classId
    })
    
    if (!classId) {
      util.showError('请先输入学号')
      wx.navigateBack()
    }
  },

  /**
   * 修改学号
   */
  changeClassId() {
    wx.navigateBack()
  },

  /**
   * 选择文件
   */
  async chooseFile() {
    try {
      const file = await util.chooseFile()
      
      this.setData({
        selectedFile: file,
        fileSize: this.formatFileSize(file.size),
        fileStatus: '已选择',
        errorMessage: ''
      })
      
      console.log('选择的文件:', file)
    } catch (error) {
      console.error('选择文件失败:', error)
      util.showError(error.message || '选择文件失败')
    }
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 上传文件并搜索考试信息
   */
  async uploadAndSearch() {
    if (!this.data.selectedFile) {
      util.showError('请先选择文件')
      return
    }

    this.setData({
      uploading: true,
      uploadProgress: 0,
      errorMessage: ''
    })

    try {
      // 模拟上传进度
      this.simulateUploadProgress()
      
      // 由于微信小程序无法直接上传文件到Vercel，我们需要将文件读取为Base64
      const fileData = await this.readFileAsBase64(this.data.selectedFile.path)
      
      // 发送到API处理
      const response = await apiService.searchByClassId(this.data.classId, {
        fileData: fileData,
        fileName: this.data.selectedFile.name
      })

      if (response.success) {
        // 保存考试数据到全局状态
        app.globalData.examData = response.data
        
        // 保存到历史记录
        this.saveToHistory(response.data)
        
        // 跳转到结果页
        wx.redirectTo({
          url: `/pages/result/result?classId=${this.data.classId}`
        })
      } else {
        throw new Error(response.message || '查询失败')
      }
      
    } catch (error) {
      console.error('上传失败:', error)
      this.setData({
        errorMessage: error.message || '上传失败，请重试'
      })
      util.showError(error.message || '上传失败')
    } finally {
      this.setData({
        uploading: false,
        uploadProgress: 0
      })
    }
  },

  /**
   * 模拟上传进度
   */
  simulateUploadProgress() {
    let progress = 0
    const timer = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 90) {
        progress = 90
        clearInterval(timer)
      }
      this.setData({
        uploadProgress: Math.round(progress)
      })
    }, 200)
    
    // 存储定时器ID，以便在页面卸载时清除
    this.progressTimer = timer
  },

  /**
   * 读取文件为Base64
   */
  readFileAsBase64(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success(res) {
          resolve(res.data)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },

  /**
   * 保存到历史记录
   */
  saveToHistory(examData) {
    const recentExams = util.getStorage('recentExams') || []
    
    // 检查是否已存在相同学号的记录
    const existingIndex = recentExams.findIndex(item => item.classId === this.data.classId)
    
    const newRecord = {
      classId: this.data.classId,
      examData: examData,
      examCount: examData.length,
      time: util.formatTime(new Date()),
      timestamp: Date.now()
    }
    
    if (existingIndex >= 0) {
      // 更新现有记录
      recentExams[existingIndex] = newRecord
    } else {
      // 添加新记录到开头
      recentExams.unshift(newRecord)
    }
    
    // 只保留最近10条记录
    if (recentExams.length > 10) {
      recentExams.splice(10)
    }
    
    util.setStorage('recentExams', recentExams)
  },

  /**
   * 手动输入
   */
  manualInput() {
    wx.showModal({
      title: '手动输入考试信息',
      content: '您可以手动输入考试信息，每行一个考试，格式：课程名称,考试时间,考试地点',
      editable: true,
      placeholderText: '例如：高等数学,2024-01-15 09:00-11:00,教学楼A101',
      success: (res) => {
        if (res.confirm && res.content) {
          this.parseManualInput(res.content)
        }
      }
    })
  },

  /**
   * 解析手动输入的数据
   */
  parseManualInput(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim())
      const examData = []
      
      lines.forEach(line => {
        const parts = line.split(',')
        if (parts.length >= 2) {
          examData.push({
            course: parts[0].trim(),
            time: parts[1].trim(),
            location: parts[2] ? parts[2].trim() : '待定',
            classId: this.data.classId
          })
        }
      })
      
      if (examData.length > 0) {
        app.globalData.examData = examData
        this.saveToHistory(examData)
        
        wx.redirectTo({
          url: `/pages/result/result?classId=${this.data.classId}`
        })
      } else {
        util.showError('请检查输入格式')
      }
    } catch (error) {
      util.showError('解析失败，请检查输入格式')
    }
  },

  onUnload() {
    // 清除定时器
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
  }
}) 