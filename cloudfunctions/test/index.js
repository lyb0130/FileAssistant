// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var utc_datetime = new Date()
  console.log(utc_datetime)
  console.log(utc_datetime.getTime())
  console.log(Date.parse("2020/11/7 10:12:00"))
  var ltime = new Date("1990/01/01 08:00:00")
  console.log(ltime)
  console.log(ltime.getTime())
  // var T_pos = utc_datetime.indexOf('T');
  // var Z_pos = utc_datetime.indexOf('Z');
  // var year_month_day = utc_datetime.substr(0, T_pos);
  // var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  // var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06
  // 处理成为时间戳
 var  timestamp = new Date(Date.parse(utc_datetime));
  timestamp = timestamp.getTime();
  timestamp = timestamp / 1000;

  // 增加8个小时，北京时间比utc时间多八个时区
  var timestamp = timestamp + 8 * 60 * 60;
  console.log(timestamp)

  // 时间戳转为时间
  // var beijing_datetime = new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
  // var beijing_datetime = new Date(parseInt(timestamp) * 1000)


  //const wxContext = cloud.getWXContext()
  // const openid = wxContext.OPENID
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}