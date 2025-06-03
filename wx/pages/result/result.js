const util = require('../../utils/util.js')
const apiService = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    classId: '',
    examData: [],
    loading: false,
    generating: false,
    errorMessage: ''
  },

  onLoad(options) {
    const classId = options.classId || app.globalData.classId || ''
    this.setData({
      classId: classId
    })

    // 从全局状态获取考试数据
    const examData = app.globalData.examData || []
    if (examData.length > 0) {
      this.setData({
        examData: examData
      })
    } else {
      // 如果没有数据，返回上一页
      util.showError('未找到考试数据')
      wx.navigateBack()
    }
  },

  onShow() {
    // 刷新数据
    if (app.globalData.examData) {
      this.setData({
        examData: app.globalData.examData
      })
    }
  },

  /**
   * 生成日历文件
   */
  async generateCalendar() {
    if (this.data.examData.length === 0) {
      util.showError('没有考试数据')
      return
    }

    this.setData({
      generating: true,
      errorMessage: ''
    })

    try {
      util.showLoading('正在生成日历文件...')
      
      const response = await apiService.generateIcs(this.data.examData)
      
      if (response.success) {
        // 在微信小程序中，我们不能直接下载文件
        // 而是要通过其他方式分享ICS内容
        this.handleIcsGenerated(response.icsContent)
      } else {
        throw new Error(response.message || '生成失败')
      }
      
    } catch (error) {
      console.error('生成日历失败:', error)
      this.setData({
        errorMessage: error.message || '生成日历失败，请重试'
      })
      util.showError(error.message || '生成失败')
    } finally {
      this.setData({
        generating: false
      })
      util.hideLoading()
    }
  },

  /**
   * 处理ICS文件生成完成
   */
  handleIcsGenerated(icsContent) {
    wx.showModal({
      title: '日历文件生成成功',
      content: '由于小程序限制，无法直接下载文件。建议您：\n1. 复制文件内容到电脑\n2. 保存为.ics文件\n3. 导入到日历应用',
      confirmText: '复制内容',
      cancelText: '稍后处理',
      success: (res) => {
        if (res.confirm) {
          // 复制到剪贴板
          wx.setClipboardData({
            data: icsContent,
            success: () => {
              util.showSuccess('内容已复制到剪贴板')
              
              // 显示详细使用说明
              setTimeout(() => {
                this.showUsageInstructions()
              }, 1000)
            },
            fail: () => {
              util.showError('复制失败')
            }
          })
        }
      }
    })
  },

  /**
   * 显示使用说明
   */
  showUsageInstructions() {
    wx.showModal({
      title: '使用说明',
      content: '1. 在电脑上新建文本文件\n2. 粘贴剪贴板内容\n3. 保存为"考试安排.ics"\n4. 双击文件导入到日历应用\n\n支持：Google日历、Outlook、Apple日历等',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  /**
   * 分享考试安排
   */
  shareResult() {
    const examList = this.data.examData.map((exam, index) => {
      const course = exam.course || exam['课程名称'] || '未知课程'
      const time = exam.time || exam['考试时间'] || '时间待定'
      const location = exam.location || exam['考试地点'] || '地点待定'
      return `${index + 1}. ${course}\n   时间：${time}\n   地点：${location}`
    }).join('\n\n')

    const shareContent = `${this.data.classId} 考试安排\n\n${examList}\n\n来自：南邮考试日历生成器`

    wx.setClipboardData({
      data: shareContent,
      success: () => {
        util.showSuccess('考试安排已复制到剪贴板')
      },
      fail: () => {
        util.showError('复制失败')
      }
    })
  },

  /**
   * 返回重新查询
   */
  goBack() {
    wx.navigateBack()
  },

  /**
   * 分享给好友
   */
  onShareAppMessage() {
    return {
      title: `${this.data.classId} 的考试安排`,
      desc: `共${this.data.examData.length}场考试，点击查看详情`,
      path: `/pages/result/result?classId=${this.data.classId}&shared=true`
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: `南邮考试日历 - ${this.data.classId} 考试安排`,
      query: `classId=${this.data.classId}`
    }
  },

  /**
   * 页面下拉刷新
   */
  onPullDownRefresh() {
    // 重新获取数据的逻辑
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
}) 