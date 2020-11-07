// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// const _ = db.command
// const $ = _.aggregate
// 云函数入口函数

exports.main = async (event, context) => {
  //后续会对此部分进行优化
  var nowTime = new Date().getTime() + 8 * 3600 * 1000
  var middleTime = new Date(nowTime).getTime() + 3600 * 1000 //现在时间加一小时
  console.log(middleTime)
  console.log(nowTime)
  return new Promise((resolve) => {
      console.log("获取所有问卷")
      setTimeout(() => {
        resolve(db.collection("demo").get())
      }, 500)
    })
    .then(res => {
      console.log(res)
      console.log("已获取所有问卷，开始遍历问卷")
      let i = 0
      let time = 0
      return Promise.resolve(res.data.forEach(temp => {
        // for (let i in res.data) {
        //遍历所有问卷表

        setTimeout(() => {
          console.log("遍历问卷", i)
          new Promise((resolve) => {
            var endTime = new Date(temp.deadline).getTime()
            console.log("分析时间", i)
            setTimeout(() => {
              resolve(endTime)
            })
          }).then(endTime => {
            console.log(temp.deadline, ": ", endTime)
            if (endTime <= middleTime && endTime > nowTime) {
              //距离提交时间在一小时以内，发送提醒消息
              console.log("一小时内", i)
              //发送订阅消息
              var idList = Array.from({
                  length: temp.content.length
                },
                (_c, h) => temp['content'][h][2]
              )
              let j = 0
              return new Promise((resolve => {
                resolve(idList.forEach(item => {
                  // for (let j in idList) {
                  new Promise((resolve) => {
                      console.log("遍历名单", i, j++)
                      //获取_openid
                      setTimeout(() => {
                        resolve(db.collection("user").where({
                          sno: item
                        }).get())
                      }, 50)
                    })
                    .then(t => {
                      return new Promise((resolve) => {
                        setTimeout(() => {
                          console.log("获取_openid", i, j)
                          const openid = t.data[0]._openid
                          console.log(openid, i, j)
                          if (t.data[0]._openid != undefined) {
                            console.log("发送订阅消息", i - 1, j)
                            resolve(cloud.openapi.subscribeMessage.send({
                              touser: openid,
                              page: 'pages/home/index/index',
                              miniprogram_state: 'developer',
                              data: {
                                thing1: {
                                  value: temp.title //问卷名称
                                },
                                // name2: {
                                //   value: t.data[0].name //填写人
                                // },
                                time4: {
                                  value: temp.deadline.replace(/\//g, "-").slice(0, -3) //截止时间
                                }
                              },
                              template_id: 'GL07ZsPoox1uVijvkFp5GHwEv-2q82WTJzKTG036DKI' //模板ID
                            }))
                          }
                        }, 50)
                      })
                    }).then(res => console.log(res)).catch(err => console.log(err))
                  // }
                }))
                i++
              }))
            } else if (nowTime >= endTime && nowTime < endTime + 0.5 * 3600 * 1000) {
              //已过截止时间，停止问卷的提交，并导出问卷，给发布者发送订阅消息(下载链接）
              console.log("已到期", i)
              db.collection("demo").where({
                title: temp.title
              }).update({
                data: {
                  IsActive: false
                }
              })
              //发布订阅消息
              return new Promise((resolve) => {
                  console.log("获取发布者_openid", i)
                  const creater_id = temp.creater_id
                  setTimeout(() => {
                    resolve(db.collection("user").where({
                      sno: creater_id
                    }).get())
                  }, 50)
                })
                .then(it => {
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      console.log("发送问卷终止消息", i++)
                      console.log(it.data[0]._openid)
                      resolve(cloud.openapi.subscribeMessage.send({
                        touser: it.data[0]._openid,
                        page: 'pages/home/index/index',
                        miniprogram_state: 'developer',
                        lang: 'zh_CN',
                        data: {
                          thing1: {
                            value: temp.title //文件名
                          },
                          character_string2: {
                            value: 'excel(xlsx)' //文件格式
                          },
                          time3: {
                            value: temp.deadline.replace(/\//g, "-").slice(0, -3) //导出时间
                          }
                        },
                        template_id: 'fmJKCnyUjVt8262QMpjeyiuIAQ7jVVewRZpngKxoLro' //模板ID
                      }))
                    }, 200)
                  })
                }).then(res => console.log(res)).catch(err => console.log(err))
            } else {
              //时间尚早
              console.log("时间尚早", i)
              i++
            }
          })
        }, 500 * time++)
        // }
      }))
    }).then(res => console.log(res)).catch(err => console.log(err))
}