const app = getApp()

Page({
  data: {
    classId: '',
    isLoading: false
  },

  // 输入框内容变化时触发
  onInput(e) {
    this.setData({
      classId: e.detail.value
    })
  },

  // 提交表单
  onSubmit() {
    const classId = this.data.classId
    if (!classId || classId.length !== 7) {
      wx.showToast({
        title: '请输入7位行政班号',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    wx.request({
      url: `${app.globalData.apiBaseUrl}/search-by-class-id`,
      method: 'POST',
      data: {
        classId: classId
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('API返回数据：', res.data)
        if (res.statusCode === 200 && res.data.success) {
          // 只存储examData字段
          const examData = res.data.examData
          console.log('考试数据：', examData)
          
          // 将结果数据存入全局
          app.globalData.examData = examData
          console.log('存入全局数据：', app.globalData.examData)
          
          // 跳转到结果页
          wx.navigateTo({
            url: '/pages/result/result'
          })
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求失败：', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  }
}) 