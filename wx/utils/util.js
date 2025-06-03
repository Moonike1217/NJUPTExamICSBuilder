/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 验证学号格式
 */
const validateClassId = (classId) => {
  if (!classId || typeof classId !== 'string') {
    return false
  }
  
  // 必须以 B、Q、P 或 F 开头，总长度为7位
  const regex = /^[BQPF]\d{6}$/
  return regex.test(classId.toUpperCase())
}

/**
 * 格式化考试时间显示
 */
const formatExamTime = (examInfo) => {
  if (!examInfo.date || !examInfo.time) {
    return '时间待定'
  }
  
  return `${examInfo.date} ${examInfo.time}`
}

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 */
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 */
const showError = (title = '操作失败') => {
  wx.showToast({
    title: title,
    icon: 'error',
    duration: 2000
  })
}

/**
 * 显示确认对话框
 */
const showConfirm = (options) => {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '确认',
      content: options.content || '',
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success(res) {
        resolve(res.confirm)
      },
      fail() {
        resolve(false)
      }
    })
  })
}

/**
 * 选择文件
 */
const chooseFile = () => {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xlsx', 'xls'],
      success(res) {
        const file = res.tempFiles[0]
        if (file.size > 10 * 1024 * 1024) { // 限制10MB
          reject(new Error('文件大小不能超过10MB'))
          return
        }
        resolve(file)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/**
 * 保存数据到本地存储
 */
const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('保存数据失败', e)
    return false
  }
}

/**
 * 从本地存储获取数据
 */
const getStorage = (key) => {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    console.error('获取数据失败', e)
    return null
  }
}

/**
 * 清除本地存储
 */
const clearStorage = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('清除数据失败', e)
    return false
  }
}

module.exports = {
  formatTime,
  validateClassId,
  formatExamTime,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  chooseFile,
  setStorage,
  getStorage,
  clearStorage
} 