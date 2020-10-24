//获取服务器时间时间戳（UTC时间已经转为北京时间）
/*服务器端new Date()为UTC时间，new Date().getTime()为北京时间时间戳
*/
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})

// 云函数入口函数
exports.main = async (event, context) => {
  return new Date().getTime()
}