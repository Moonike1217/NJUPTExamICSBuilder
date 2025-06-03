const app = getApp()

/**
 * API请求封装
 */
class ApiService {
  constructor() {
    this.baseUrl = app.globalData.apiBaseUrl
  }

  /**
   * 通用请求方法
   */
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'content-type': options.contentType || 'application/json',
          ...options.header
        },
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`))
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }

  /**
   * 上传文件到服务器
   */
  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url: `${this.baseUrl}/upload-excel`,
        filePath: filePath,
        name: 'excel',
        header: {
          'content-type': 'multipart/form-data'
        },
        success(res) {
          try {
            const data = JSON.parse(res.data)
            if (data.success) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            reject(new Error('响应解析失败'))
          }
        },
        fail(err) {
          reject(err)
        }
      })

      // 可以监听上传进度
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度', res.progress)
      })
    })
  }

  /**
   * 根据学号查询考试信息
   */
  async searchByClassId(classId, examData) {
    try {
      const response = await this.request({
        url: '/search-by-class-id',
        method: 'POST',
        data: {
          classId: classId,
          examData: examData
        }
      })
      return response
    } catch (error) {
      throw new Error(`查询失败: ${error.message}`)
    }
  }

  /**
   * 生成ICS日历文件
   */
  async generateIcs(examData) {
    try {
      const response = await this.request({
        url: '/generate-ics',
        method: 'POST',
        data: { examData }
      })
      return response
    } catch (error) {
      throw new Error(`生成日历失败: ${error.message}`)
    }
  }

  /**
   * 下载文件
   */
  downloadFile(url, fileName) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success(res) {
          if (res.statusCode === 200) {
            // 保存到相册或分享
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success(saveRes) {
                resolve(saveRes.savedFilePath)
              },
              fail(err) {
                reject(err)
              }
            })
          } else {
            reject(new Error('下载失败'))
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }
}

module.exports = new ApiService() 