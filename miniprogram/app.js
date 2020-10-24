//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'file-3gcxwtoae61be7b7',
        // env: cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true,
      })
    }
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.cloud.callFunction({
      name: "save_openID",
      data:{
        id: this.globalData.unique_id
      }
    }).then(res=>{
      console.log(res)
      this.globalData.unique_id = res.result[0]
      this.globalData.openid = res.result[1]
      if(this.globalData.unique_id == -1){
        this.globalData.IsVistor = true
      }
    })
  },

  globalData: {
    unique_id: 0,//0,
    openid:"",
    judgment: true,
    index: 0,
    IsVistor: false,
  }


})