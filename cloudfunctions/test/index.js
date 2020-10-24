// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // const openid = wxContext.OPENID
  return cloud.openapi.subscribeMessage.send({
    templatedId: 'fmJKCnyUjVt8262QMpjeyiuIAQ7jVVewRZpngKxoLro',
    tourser: 'o_xmv4omi6B84Axx1tAjCbDe8ubk',
    page: 'pages/home/index/index',
    miniprogramState: 'developer',
    lang: 'zh_CN',
    data: {
      thing1: {
        value: '每日温度打卡' //文件名
      },
      character_string2: {
        value: 'excel.xlsx' //文件格式
      },
      time3: {
        value: '2020-10-10 12:00:00' //导出时间
      }
    },
     //模板ID
  })
  // .then(res=>console.log(res)).catch(err=>console.log(err))
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
  }                                                                                                                         