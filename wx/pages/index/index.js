const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    classId: '',
    isClassIdValid: false,
    recentExams: []
  },

  onLoad(options) {
    console.log('首页加载')
    this.loadRecentExams()
    
    // 如果有传入的学号，自动填充
    if (options.classId) {
      this.setData({
        classId: options.classId
      })
      this.validateClassId(options.classId)
    }
  },

  onShow() {
    // 刷新历史记录
    this.loadRecentExams()
  },

  /**
   * 学号输入处理
   */
  onClassIdInput(e) {
    const classId = e.detail.value.toUpperCase()
    this.setData({
      classId: classId
    })
    this.validateClassId(classId)
  },

  /**
   * 验证学号
   */
  validateClassId(classId) {
    const isValid = util.validateClassId(classId)
    this.setData({
      isClassIdValid: isValid
    })
    
    if (isValid) {
      app.globalData.classId = classId
    }
  },

  /**
   * 跳转到上传页面
   */
  goToUpload() {
    if (!this.data.isClassIdValid) {
      util.showError('请输入正确的学号格式')
      return
    }

    wx.navigateTo({
      url: `/pages/upload/upload?classId=${this.data.classId}`
    })
  },

  /**
   * 加载历史记录
   */
  loadRecentExams() {
    const recentExams = util.getStorage('recentExams') || []
    this.setData({
      recentExams: recentExams.slice(0, 5) // 只显示最近5条
    })
  },

  /**
   * 使用历史记录项
   */
  useHistoryItem(e) {
    const index = e.currentTarget.dataset.index
    const historyItem = this.data.recentExams[index]
    
    if (historyItem) {
      this.setData({
        classId: historyItem.classId
      })
      this.validateClassId(historyItem.classId)
      
      // 如果有缓存的考试数据，直接跳转到结果页
      if (historyItem.examData) {
        app.globalData.examData = historyItem.examData
        wx.navigateTo({
          url: `/pages/result/result?classId=${historyItem.classId}&fromHistory=true`
        })
      } else {
        // 否则跳转到上传页
        this.goToUpload()
      }
    }
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    return {
      title: '南邮考试日历生成器',
      desc: '快速将考试信息转换为日历文件',
      path: '/pages/index/index'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '南邮考试日历生成器 - 考试安排一目了然',
      query: ''
    }
  }
}) 