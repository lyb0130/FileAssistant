// pages/personalCenter/advice/advice.js
wx.cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width: 0,
  },

  save(e) {
    console.log(e.detail.value)
    wx.cloud.database().collection("advice").add({
        data: {
          content: e.detail.value.textarea
        }
      }).then(res => {
        console.log(res)
        wx.showToast({
          title: '提交成功',
          duration: 2000,
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 2000)
      })
      .catch(err => console.log(err))

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        let width = res.windowWidth * 0.6;
        console.log(width)
        that.setData({
          //圆点坐标,x为屏幕一半,y为半径与margin-top之和,px
          //后面获取的触摸坐标是px,所以这里直接用px.
          width: width,

        })
      }
    })
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