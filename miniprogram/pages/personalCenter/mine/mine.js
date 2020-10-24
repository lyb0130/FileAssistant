// pages/my/my.js
// var e = require("../../utils/util.js"), time = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    IsRegister: false,
    userName: "",
    userID: 0,
  },
  requestMsg() {
    wx.requestSubscribeMessage({
        tmplIds: ['fmJKCnyUjVt8262QMpjeyiuIAQ7jVVewRZpngKxoLro', 'GL07ZsPoox1uVijvkFp5GMJpN_kkQyPGWQbZRIRZHNw']
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => console.log(err))

  },
  request(){
    wx.cloud.callFunction({
      name: "test",
    }).then(res=>console.log(res)).catch(err=>console.log(err))
  },
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        let windowWidth = res.windowWidth * 0.5;
        that.setData({
          //圆点坐标,x为屏幕一半,y为半径与margin-top之和,px
          //后面获取的触摸坐标是px,所以这里直接用px.
          dotPoint: {
            clientX: windowWidth,
            clientY: 250
          }
        })
      }
    })
  },

  onShow: function () {
    if (!app.globalData.IsVistor) {
      wx.cloud.callFunction({
        name: "down_excel",
        data: {
          db_name: "user",
          keyword: "_openid",
          value: app.globalData.openid
        }
      }).then(res => {
        console.log(res)
        if (res.result.data[0]) {
          this.setData({
            IsRegister: true,
            userName: res.result.data[0].name,
            userID: res.result.data[0].sno
          })
        }
      }).catch(err => console.log(err))
    }
    console.log(app.globalData.openid)

  },
  onReady: function () {},
  openPage: function (a) {
    var e = a.currentTarget.dataset.url;
    wx.navigateTo({
      url: e
    });
  },
  editUser: function () {
    wx.navigateTo({
      url: '../info/info',
    })
  },


  onPullDownRefresh() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  },
})