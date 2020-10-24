// pages/info/info.js
//目前个人信息只有学工号与姓名两项，从mine传递即可
const app = getApp()
wx.cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userName: "",
    userID: "",
  },

  save(e) {
    console.log(e.detail.value)
    let id = parseInt(e.detail.value.id)
    let name = e.detail.value.name
    wx.cloud.callFunction({
        name: "down_excel",
        data: {
          db_name: "user",
          keyword: "sno",
          value: id
        }
      }).then(res => {
        console.log(res)
        let length = res.result.data.length
        if (length && !app.globalData.IsVistor) {
          //已注册用户，学号在库中已存在，冲突
          wx.showToast({
            title: '该学工号已存在',
            icon: "none",
            duration: 2000
          })
          throw new Promise(() => {})
        } else if (!length && !app.globalData.IsVistor) {
          //已注册用户，正常更新数据
          return wx.cloud.callFunction({
            name: "update_excel",
            data: {
              way: 1,
              _openid: app.globalData.openid,
              name: name,
              sno: id
            }
          })
        } else if (length && app.globalData.IsVistor) {
          //假游客(由发布者代为注册，但未上传_openid)
          return wx.cloud.callFunction({
            name: "update_excel",
            data: {
              way: 2,
              name: name,
              sno: id
            }
          })
        } else if (!length && app.globalData.IsVistor) {
          //游客
          return wx.cloud.database().collection("user").add({
            data: {
              sno: id,
              name: name,
            }
          })
        }
      })
      .then(res => {
        console.log(res)
        app.globalData.IsVistor = false
        app.globalData.unique_id = id
        wx.showToast({
          title: '修改成功',
          duration: 1500
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1500)
      }).catch(err => {
        console.log(err)
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
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
        this.setData({
          userName: res.result.data[0].name,
          userID: res.result.data[0].sno
        })
      }).catch(err => {
        console.log(err)
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})