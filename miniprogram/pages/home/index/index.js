//“待完成”、“已完成”、“我的文件”三类数据，各用一个TabItem类进行存储
//每一个文档问卷用一个ListItem存储，并按照类别分别存入三个TabItem类的list属性中
var P_list = [] // 待完成
var Q_list = [] // 已完成
var R_list = [] // 我的文件
const app = getApp()
let staticPageNumber = 20;
wx.cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})

class TabItem {
  constructor(title) {
    this.title = title // 标题
    this.list = [] // 数据列表
    this.placeholder = "点击刷新" // 占位提示（刷新、网络错误、空白）
    this.load_type = 0 // 0表示不显示，1表示加载中，2表示已加载全部
  }
}

// 数据item
class ListItem {
  constructor(title, deadline, remainingTime) {
    this.image_url = "../../../images/excel.png"
    this.title = title
    this.deadline = deadline
    this.remainingTime = remainingTime
  }
}

// 空白页tip
function getEmptyTip(index) {
  return ["无待完成文件", "无已完成文件", "无已发布文件"][index % 2];
}
//对对象数组进行排序
function compareDeadline(prop) {
  return function (a, b) {
    let a_time = new Date(a[prop]).getTime()
    let b_time = new Date(b[prop]).getTime()
    if (a_time > b_time) {
      return 1
    } else if (a_time < b_time) {
      return -1
    } else {
      return 0
    }
  }
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //tabs[i].list[j]为第i+1类下的第j+1个文档，共三类
    tabs: [
      new TabItem("待完成"),
      new TabItem("已完成"),
      new TabItem("我的文件")
    ],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false //手势参数
    },
    activeTab: 0, //手势相关参数
    nowTime: "", //当前时间
    //为了兼容ios，一律采用2019/11/22 10:40:30格式
    time: "", //剩余时间的毫秒形式，即时间戳
    index: 0
  },

  //新建文档问卷，点击右下角的加号触发
  addFile() {
    if (app.globalData.IsVistor) {
      wx.showModal({
        content: '请完善个人信息',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../personalCenter/info/info',
            })
          } else {
            console.log("用户点击取消")
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../upLoad/upLoad',
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取界面长宽信息
    //setData为异步赋值，故先对this.data赋值，再将this.data拷贝给setData下的副本
    console.log("三")
    try {
      var res = wx.getSystemInfoSync() //获取系统信息
      this.data.stv.lineWidth = res.windowWidth / this.data.tabs.length;
      this.data.stv.windowWidth = res.windowWidth; //可使用窗口宽度
      this.setData({
        stv: this.data.stv
      })
    } catch (e) {
      // 
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //初始化全局变量
    app.globalData.judgment = true
    wx.showLoading({
      title: 'Loading...',
    });
    //获取数据
    let that = this
    that.setData({
      index: app.globalData.index
    })
    console.log(that.data.tabs)
    return new Promise((resolve) => {
        //获取当前服务器时间，结果传递给this.data.nowTime
        setTimeout(() => {
          resolve(that.getNowTime())
        }, 500)
      }).then(() => {
        return new Promise((resolve) => {
          //获取数据库数据，根据三种类别，分别存入中间数组P_List、Q_List、R_List中，其中剩余时间需要在获取当前时间的前提下，调用this.countDown()进行计算
          setTimeout(() => {
            resolve(that.getAllData())
          }, 100)
        })
      })

      .then(() => {
        return new Promise((resolve) => {
          //将P_List、Q_List、R_List中的数据存入this.data.tabs中，使得数据显示在界面上
          setTimeout(() => {
            resolve(that.loadCouponsAtIndexRefresh(that.data.index))
          }, 100)
        })
      }).then(() => {
        return new Promise(() => {
          //倒计时，
          setTimeout(() => {
            that.updateTime()
          }, 100)
        })
      }).then(res => console.log(res))
      .catch(err => console.log(err))
  },

  //从数据库获取三类数据
  getAllData() {
    let that = this
    var n = []
    var myCreat = []
    if (!app.globalData.IsVistor) {
      //正常用户
      return new Promise((resolve) => {
          setTimeout(() => {
            resolve(wx.cloud.callFunction({
              name: "down_excel",
              data: {
                db_name: "user",
                keyword: "sno",
                value: app.globalData.unique_id
              }
            }))
          }, 500)
        })
        .then(res => {
          n = (res.result.data[0].toMeFile).sort(compareDeadline("deadline"))
          myCreat = res.result.data[0].myCreat
          console.log(n)
          console.log(myCreat)

          //把用户发布的问卷存入R_List中
          for (let i in myCreat) {
            new Promise((resolve) => {
              resolve(that.countDown(myCreat[i].deadline))
            }).then(myTime => {
              let myItem = new ListItem(myCreat[i].title, myCreat[i].deadline, myTime)
              R_list.push(myItem)
              console.log(R_list)
            }).catch(err => console.log(err))
          }

          //把用户待填写、已填写的问卷分别存入P_List、Q_List中
          for (let r in n) {
            new Promise((resolve) => {
              setTimeout(() => {
                console.log(res)
                resolve(that.countDown(n[r].deadline))
                console.log(that.data.time)
              }, )
            }).then(remainingTime => {
              if (that.data.time > 0) {
                let item = new ListItem(n[r].title, n[r].deadline, remainingTime)
                if (!n[r].IsSubmit) {
                  P_list.push(item)
                } else {
                  Q_list.push(item)
                }
              }
              console.log(P_list)
              console.log(Q_list)
              console.log("四")
            }).catch(err => {
              console.log(err)
            })
          }
        })
    } else {
      //游客
      return new Promise((resolve) => {
          setTimeout(() => {
            resolve(wx.cloud.database().collection("demo").get())
          }, )
        })
        .then(res => {
          let list = res.data.sort(compareDeadline("deadline"))
          for (let j in list) {
            new Promise((resolve) => {
              resolve(that.countDown(list[j].deadline))
            }).then(remainingTime => {
              let item = new ListItem(list[j].title, list[j].deadline, remainingTime)
              P_list.push(item)
            })
          }
          console.log(list)
        }).then(res => console.log(res))
        .catch(err => console.log(err))
    }
  },
  //倒计时
  updateTime() {
    let that = this
    let index = that.data.index
    // console.log(that.data.tabs[0].list[0].deadline)
    // console.log(new Date((that.data.tabs[0].list[0]).deadline).getTime())

    for (let r in that.data.tabs[index].list) {
      var endTime = (that.data.tabs[index].list[r]).deadline
      if (that.data.nowTime <= new Date(endTime).getTime()) {
        //尚未到截止时间
        var remainingTime = that.countDown(endTime) //计算剩余时间remainingTime

        //将剩余时间传给tabs，使得在界面上更新
        that.data.tabs[index].list[r].remainingTime = remainingTime
        that.setData({
          tabs: that.data.tabs
        })
      } else {
        that.data.tabs[index].list[r].remainingTime = "已到期"
      }
    }
    that.setData({
      nowTime: that.data.nowTime + 1000
    })
    //界面隐藏时，this.onHide()使该判定值为负，停止倒计时
    if (app.globalData.judgment) {
      //每隔一秒递归调用一次
      setTimeout(that.updateTime, 1000)
    }
  },
  //获取服务器时间
  getNowTime() {
    wx.cloud.callFunction({
      name: "get_date",
    }).then(res => {
      console.log(res)
      this.setData({
        nowTime: res.result + 4000 //程序运行至显示倒计时有4秒延迟，故在此表示
      })
      console.log(this.data.nowTime)
      console.log(new Date().getTime())
      console.log(new Date().getTime() - this.data.nowTime)
    })
  },

  // 根据deadline计算剩余时间
  countDown: function (deadline) {
    var that = this;
    var nowTime = that.data.nowTime; //现在时间（时间戳）
    var endTime = new Date(deadline).getTime(); //结束时间（时间戳）
    var time = (endTime - nowTime) / 1000; //距离结束的毫秒数
    that.setData({
      time: time
    })
    // 获取天、时、分、秒
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    // console.log(day + "," + hou + "," + min + "," + sec)
    day = that.timeFormat(that.timeFormin(day))
    hou = that.timeFormat(that.timeFormin(hou))
    min = that.timeFormat(that.timeFormin(min))
    sec = that.timeFormat(that.timeFormin(sec))
    var remainingTime = day + "天" + hou + "时" + min + "分" + sec + "秒"
    that.setData({
      remainingTime: remainingTime
    })
    console.log(that.data.remainingTime)
    return remainingTime
  },
  //小于10的格式化函数（2变成02）
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },
  //小于0的格式化函数（不会出现负数）
  timeFormin(param) {
    return param < 0 ? 0 : param;
  },

  //将P_List、Q_List、R_List中的数据存入this.data.tabs中，使得数据显示在界面上
  loadCouponsAtIndexRefresh(index = 0, isRefresh = true) {
    // loading
    wx.showLoading({
      title: 'Loading...',
    });
    // 显示加载更多
    if (!isRefresh) {
      // 已经加载全部，则不再请求
      let config = this.data.tabs[index];

      // 已经全部加载完毕
      if (!config.load_type == 2) {
        return;
      }

      var tabs = this.data.tabs;
      tabs[index].load_type = 1;
      this.setData({
        tabs: tabs
      })
    }

    setTimeout(() => {
      let res = {
        data: {
          code: 1
        }
      };

      switch (index) {
        case 0:
          res.list = P_list
          break
        case 1:
          res.list = Q_list
          break
        case 2:
          res.list = R_list.sort(compareDeadline("deadline"))
          break
        default:
          break
      }
      wx.hideLoading();

      let that = this;
      let item = that.data.tabs[index];
      var tips = item.placeholder;
      var list = item.list;

      // 请求成功
      if (res.data.code == 1) {
        if (res.list && res.list.length > 0) {
          if (isRefresh) {
            list = res.list;
          } else {
            list.push(...res.list);
          }
          // 加载更多
          var tabs = this.data.tabs;
          tabs[index].load_type = res.list.length < staticPageNumber ? 2 : 0;
          tabs[index].list = list;

          that.setData({
            tabs: tabs
          })
          return;
        } else {
          tips = getEmptyTip(index);
        }
      } else {
        tips = res.msg.length > 0 ? res.msg : "网络错误";
      }
      tips += " 点击刷新";

      var tabs = this.data.tabs;
      tabs[index].placeholder = tips;

      that.setData({
        tabs: tabs
      })

    }, 600);
  },
  // 加载更多
  loadMore(e) {
    let currentIndex = e.currentTarget.dataset.index;
    let currentTab = this.data.tabs[currentIndex];
    if (currentTab.list.length > 0 && currentTab.load_type != 2) {
      this.loadCouponsAtIndexRefresh(currentIndex, false);
    }
  },

  // 刷新
  refresh(e) {
    let currentIndex = e.currentTarget.dataset.index;
    let currentTab = this.data.tabs[currentIndex];
    if (currentTab.list.length <= 0) {
      this.loadCouponsAtIndexRefresh(currentIndex);
    }
  },

  // 手势开始
  handlerStart(e) {
    let {
      clientX,
      clientY
    } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({
      stv: this.data.stv
    })
  },

  // 手势移动
  handlerMove(e) {
    let {
      clientX,
      clientY
    } = e.touches[0];
    let {
      stv
    } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({
      stv: stv
    });
  },

  // 手势取消
  handlerCancel(e) {

  },

  // 滑动手势完成
  handlerEnd(e) {
    let {
      clientX,
      clientY
    } = e.changedTouches[0];
    // 如果是点击手势，则屏蔽当前手势的事件处理
    if (Math.abs(this.tapStartX - clientX) < 1 && Math.abs(this.tapStartY - clientY) < 1) {
      return;
    }
    // 阻止干预scrollview的上下滑动体验
    if (Math.abs(this.data.stv.offset - 0) < 1 || Math.abs(this.data.stv.offset - this.data.windowWidth) < 1) {
      return;
    }
    let endTime = e.timeStamp;
    let {
      tabs,
      stv,
      activeTab
    } = this.data;
    let {
      offset,
      windowWidth
    } = stv;

    //快速滑动
    if (endTime - this.tapStartTime <= 300) {
      //向左
      if (Math.abs(this.tapStartY - clientY) < 50) {
        if (this.tapStartX - clientX > 5) {
          if (activeTab < this.tabsCount - 1) {
            let page = ++activeTab;
            this.reloadPageIfEmpty(page);
            this.setData({
              activeTab: page
            })
          }
        } else {
          if (activeTab > 0) {
            let page = --activeTab;
            this.reloadPageIfEmpty(page);
            this.setData({
              activeTab: page
            })
          }
        }
        stv.offset = stv.windowWidth * activeTab;
      } else {
        //快速滑动 但是Y距离大于50 所以用户是左右滚动
        let page = Math.round(offset / windowWidth);
        if (activeTab != page) {
          this.setData({
            activeTab: page
          })
          this.reloadPageIfEmpty(page);
        }
        stv.offset = stv.windowWidth * page;
      }
    } else {
      let page = Math.round(offset / windowWidth);

      if (activeTab != page) {
        this.setData({
          activeTab: page
        })
        this.reloadPageIfEmpty(page);
      }
      stv.offset = stv.windowWidth * page;
    }

    stv.tStart = false;
    this.setData({
      stv: this.data.stv
    })
  },

  // item点击
  itemTap(e) {
    console.log(e);
    console.log(e.currentTarget.dataset.title)
    if (app.globalData.IsVistor) {
      wx.showModal({
        content: '请完善个人信息',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../personalCenter/info/info',
            })
          } else {
            console.log("用户点击取消")
          }
        }
      })
    } else {
      if (this.data.index != 2) {
        wx.navigateTo({
          url: '../survey/survey?title=' + e.currentTarget.dataset.title,
        })
      } else {
        wx.navigateTo({
          url: '../detail/detail?fileName=' + e.currentTarget.dataset.title, //跳转到详情页，包括未提交人员名单，。。。
        })
      }
    }

  },

  // 更新选中的page
  updateSelectedPage(page) {
    // 屏蔽重复选中
    if (this.data.activeTab == page) {
      return;
    }
    let {
      tabs,
      stv,
      activeTab
    } = this.data;
    activeTab = page;
    this.setData({
      activeTab: activeTab
    })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({
      stv: this.data.stv
    })
    this.reloadPageIfEmpty(page);
  },

  reloadPageIfEmpty(page) {
    // 重新请求
    if (this.data.tabs[page].list.length <= 0) {
      this.loadCouponsAtIndexRefresh(page);
    }
  },

  // item view 点击
  handlerTabTap(e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    app.globalData.index = index
    this.setData({
      index: index
    })
    this.updateSelectedPage(index);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `高效办公、放心使用`,
      desc: '高效、便捷、大家都在用',
      path: '/pages/login/login'
    }
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
    P_list = []
    Q_list = []
    R_list = []
    app.globalData.judgment = false
    let that = this
    return new Promise((resolve) => {
      setTimeout(() => {
        let tabs = that.data.tabs
        tabs.splice(0, tabs.length)
        tabs.push(new TabItem("待完成"))
        tabs.push(new TabItem("已完成"))
        tabs.push(new TabItem("我的文件"))
        resolve(that.setData({
          tabs: tabs
        }))
      }, 500)
    }).then((res) => {
      console.log(that.data.tabs)
      console.log(res)
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
    // wx.showNavigationBarLoading() //在标题栏中显示加载
    // //模拟加载
    // this.onShow()
    // setTimeout(function () {
    //   // complete
    //   wx.hideNavigationBarLoading() //完成停止加载
    //   wx.stopPullDownRefresh() //停止下拉刷
    // }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //utc时间转北京时间
  //   utc_beijing(utc_datetime) {
  //     // 转为正常的时间格式 年-月-日 时:分:秒
  //     console.log()
  //     var T_pos = utc_datetime.indexOf('T');
  //     var Z_pos = utc_datetime.indexOf('Z');
  //     var year_month_day = utc_datetime.substr(0, T_pos);
  //     var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  //     var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06
  // console.log(new Date("2017/03/31 08:02:06").getTime())
  //     // 处理成为时间戳
  //     timestamp = new Date(Date.parse(new_datetime));
  //     timestamp = timestamp.getTime();
  //     timestamp = timestamp / 1000;

  //     // 增加8个小时，北京时间比utc时间多八个时区
  //     var timestamp = timestamp + 8 * 60 * 60;
  //     return timestamp * 1000

  //     // 时间戳转为时间
  //     // var beijing_datetime = new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
  //     var beijing_datetime = new Date(parseInt(timestamp) * 1000)
  //     return beijing_datetime; // 2017-03-31 16:02:06
  //   },
})