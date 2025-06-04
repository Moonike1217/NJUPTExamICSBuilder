const app = getApp()

Page({
  data: {
    examData: [],
    selectedExams: {}
  },

  onLoad() {
    const data = app.globalData.examData || []
    // 按studentCount排序
    const sortedData = data.sort((a, b) => b.studentCount - a.studentCount)
    
    this.setData({
      examData: sortedData,
      // 初始化选中状态为全不选
      selectedExams: sortedData.reduce((acc, _, index) => {
        acc[index] = false
        return acc
      }, {})
    })

    console.log(this.data.examData);
  },

  // 处理考试项选择
  onExamSelect(e) {
    const index = e.currentTarget.dataset.index
    const selectedExams = this.data.selectedExams
    selectedExams[index] = !selectedExams[index]
    
    this.setData({
      selectedExams
    })
  },

  // 生成并下载ICS文件
  generateICS() {
    const selectedData = this.data.examData.filter((_, index) => 
      this.data.selectedExams[index]
    )

    if (selectedData.length === 0) {
      wx.showToast({
        title: '请至少选择一门考试',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '正在生成日历...'
    })

    // 调用后端API生成ICS文件
    wx.request({
      url: `${app.globalData.apiBaseUrl}/generate-ics`,
      method: 'POST',
      data: {
        examData: selectedData
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          // 显示操作菜单
          wx.showActionSheet({
            itemList: ['保存到手机', '预览内容'],
            success: (result) => {
              if (result.tapIndex === 0) {
                // 保存文件
                this.saveICSFile(res.data)
              } else if (result.tapIndex === 1) {
                // 预览内容
                this.previewICSContent(res.data)
              }
            }
          })
        } else {
          wx.showToast({
            title: '生成失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求失败', err)
        wx.hideLoading()
        wx.showToast({
          title: '生成文件失败',
          icon: 'none'
        })
      }
    })
  },

  // 保存ICS文件
  saveICSFile(data) {
    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/exams.ics`

    try {
      fs.writeFileSync(
        filePath,
        data,
        'utf8'
      )
      
      wx.shareFileMessage({
        filePath: filePath,
        success: () => {
          wx.showToast({
            title: '文件已保存',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('保存失败', err)
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    } catch (err) {
      console.error('写入文件失败', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 预览ICS内容
  previewICSContent(data) {
    // 将ICS内容格式化为可读形式
    const content = this.formatICSContent(data)
    wx.showModal({
      title: '日历内容预览',
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 格式化ICS内容
  formatICSContent(data) {
    const selectedExams = this.data.examData.filter((_, index) => 
      this.data.selectedExams[index]
    )
    
    return selectedExams.map(exam => 
      `${exam.courseName}\n` +
      `时间：${exam.date} ${exam.startTime}-${exam.endTime}\n` +
      `地点：${exam.location}\n` +
      `教师：${exam.teacher}\n`
    ).join('\n')
  }
}) 