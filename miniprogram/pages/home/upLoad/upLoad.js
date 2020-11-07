const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: "",
    time: "",
    deadline: "",
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value.replace(/-/g, "/")
    })
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value.replace(/-/g, "/")
    })
  },
  compare(thetime) { //时间比较函数，与当前时间相比较
    // var thetime = '2020-10-06 17:37:40';
    var d = new Date(Date.parse(thetime.replace(/-/g, "/")));
    var curDate = new Date();
    console.log(curDate)
    console.log(d)
    if (d <= curDate) {
      console.log("小于当前时间");
      return 0
    } else {
      console.log("大于当前时间");
      return 1
    }
  },
  upDate() {
    let that = this
    that.data.deadline = that.data.date + " " + that.data.time + ":00"
    if (that.data.date && that.data.time != 0 && that.compare(that.data.deadline)) {
      that.click()
    } else {
      wx.showToast({
        title: '请输入合法时间',
        icon: 'none', //如果要纯文本，不要icon，将值设为'none'
        duration: 2000
      })
    }
  },

  //选择文件
  click() {
    wx.showLoading({
      title: 'Loading...',
      mask: true
    })
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: res => {
        
        var filePath = res.tempFiles[0].path
        var fileName = res.tempFiles[0].name
        this.cloudFile(filePath, fileName)
      }
      ,
      fail: err => {
        wx.hideLoading()
        console.log(err)
      }
    })
  },

  //把文件上传至云存储
  cloudFile(path, fileName) {
    wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: path
    }).then(res => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.analysis(res.fileID, fileName))
        }, 10)
      })
    }).then(res => {
      if (res.result == 2) {
        wx.showToast({
          title: '该文件已存在！',
          icon: 'none', //如果要纯文本，不要icon，将值设为'none'
          duration: 1000
        })
      }else if(res.result == 1){
        wx.showToast({
          title: '上传成功！',
          duration: 1000
        })
      }
      return new Promise((resolve) => {
        wx.hideLoading()
        resolve(wx.navigateBack({
          delta: 1
        }))
      }, 10)
    })
  },

  //解析文件
  analysis(fileId, fileName) {
    return wx.cloud.callFunction({
        name: "up_excel",
        data: {
          creater_id: app.globalData.unique_id,
          creater_name:app.globalData.name,
          fileID: fileId,
          fileName: fileName,
          deadline: this.data.deadline
        }
      })
  },
})