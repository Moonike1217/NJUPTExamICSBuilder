App({
  globalData: {
    // Vercel API 基础地址
    apiBaseUrl: 'https://your-vercel-domain.vercel.app/api',
    // 当前考试数据
    examData: null,
    // 当前学号
    classId: ''
  },

  onLaunch() {
    console.log('南邮考试日历小程序启动')
    
    // 检查小程序版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
        }
      })
    }
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  }
}) 