// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileName: "", //每日温度打卡表1.xlsx
    fileUrl: "",
    notSubmitNumber: -1,
    notSubmitName: []
  },
  copy() {
    wx.setClipboardData({
      data: this.data.fileUrl
    }).then(res => {
      console.log(res)
    })
  },
  delete() {
    let that = this
    wx.showModal({
      title: '是否确认删除',
      success(res) {
        if (res.confirm) {
          console.log("用户确认删除")
          wx.showLoading({
            title: 'Loading...',
            mask: true
          })
          return new Promise((resolve) => {
              // setTimeout(() => {
              resolve(wx.cloud.callFunction({
                name: "delete_excel",
                data: {
                  fileName: that.data.fileName
                }
              }))
              // }, 500)
            })
            .then(res => {
              console.log(res, "删除成功")
              return new Promise((resolve) => {

                wx.showToast({
                  title: '删除成功',
                  duration: 2000
                })            
                wx.hideLoading()
                setTimeout(() => {
                resolve(wx.navigateBack({
                  delta: 1
                }))
                }, 20)
              })
            })
            .catch(err => console.log(err))
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  export () {
    let that = this
    wx.showLoading({
      title: 'Loading...',
      mask: true
    })
    wx.cloud.callFunction({
      name: "export_excel",
      data: {
        fileName: that.data.fileName
      }
    }).then(res => {
      console.log(res)
      that.getFileUrl(res.result.fileID)
    })
  },
  getFileUrl(fileID) {
    let that = this
    wx.cloud.getTempFileURL({
      fileList: [fileID]
    }).then(res => {
      that.setData({
        fileUrl: res.fileList[0].tempFileURL
      })
      wx.hideLoading()
      console.log(that.data.fileUrl)
    })
  },

  onLoad: function (options) {
    this.data.fileName = options.fileName
    this.setData({
      fileName: this.data.fileName
    })
    // getApp().globalData.judgment = false
  },

  onShow: function () {
    let that = this
    return new Promise((resolve) => {
        resolve(wx.cloud.callFunction({
          name: "down_excel",
          data: {
            db_name: "demo",
            keyword: "title",
            value: that.data.fileName
          }
        }))
      }).then(re => {
        let res = re.result.data[0].content
        for (let i in res) {
          if (!res[i][0]) {
            that.data.notSubmitName.push(res[i][3])
          }
        }
        that.setData({
          notSubmitNumber: that.data.notSubmitName.length,
          notSubmitName: that.data.notSubmitName
        })

      }).then(res => console.log(res))
      .catch(err => console.log(err))
  },

 onHide: function(){
   this.setData({
     notSubmitName: []
   })
 },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})