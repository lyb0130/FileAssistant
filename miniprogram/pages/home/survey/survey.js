// pages/survey/survey.js
const app = getApp()
wx.cloud.init({
  // env: cloud.DYNAMIC_CURRENT_EN
  env: 'file-3gcxwtoae61be7b7'
})
const db = wx.cloud.database()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "",//每日温度打卡表1.xlsx
    questionList: [],
    answerList: [],
    index: -1,
    indexList: []
  },

  //在提交之后indexList已于数据库中不同，故不支持连续点击提交
  save(e) {
    //提交数据
    console.log(e.detail.value)
    let answer = Object.values(e.detail.value)
    console.log(app.globalData.unique_id)
    answer[0] = app.globalData.unique_id
    //数组cur存储answer中的空项
    let cur = answer.filter(function (item) {
      if (item == '') return true
    })
    console.log(cur)
    if (cur.length == 0) {
      //所填写内容未有空项

      // 把所填写结果整理成一维数组，并加入前两列（是否提交、序号）
      let that = this
      let arr = [true, that.data.index + 1]

      answer = arr.concat(answer)
      console.log(answer)
      return new Promise((resolve) => {
          resolve(wx.cloud.callFunction({
            name: "submit_data",
            data: {
              // id: app.globalData.unique_id,
              title: that.data.title,
              answer: answer,
              indexList: that.data.indexList
            }
          }))
        })
        .then(res => {
          console.log("提交成功！", res)
          app.globalData.judgment = true
          wx.navigateBack({
            delta: 1,
          })
          wx.showToast({
            title: '提交成功',
            duration: 2000
          })
        })
    } else {
      wx.showToast({
        title: '请完成所有选项的填写！',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.title = options.title
    this.setData({
      title: this.data.title
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    let that = this
    return wx.cloud.callFunction({
        name: "down_excel",
        data: {
          keyword: "title",
          value: that.data.title,
          db_name: "demo"
        }
      }).then(res => {
        let header = res.result.data[0].header
        //不展示序号
        header.shift()
        that.data.questionList = header
        console.log(header)
        that.setData({
          questionList: that.data.questionList
        })
        //获取已有答案
        let list = res.result.data[0].content
        let i = 0
        while (list[i][2] != app.globalData.unique_id) {
          i++
        }
        that.data.answerList = list[i].slice(2)
        that.setData({
          index: i,
          indexList: list[i],
          answerList: that.data.answerList
        })
        console.log(that.data.answerList)
        console.log(list)
        // console.log(res)
      })
      .then(res => console.log(res))
      .catch(err => console.log(err))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      questionList: [],
      answerList: [],
      index: -1,
      indexList: []
    })
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