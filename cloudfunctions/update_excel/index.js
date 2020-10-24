// 云函数入口文件
//更新方式一：根据_openid，更新name、sno
//更新方式二：根据sno，更新name、_openid
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var name = event.name
  var sno = event.sno
  if (event.way == 1) {
    return db.collection("user").where({
      _openid: event._openid
    }).update({
      data: {
        name: name,
        sno: sno
      }
    }).then(res => console.log(res)).catch(err => console.log(err))
  } else if (event.way == 2) {
    return db.collection("user").where({
      sno: sno
    }).update({
      data: {
        name: name,
        _openid: cloud.getWXContext().OPENID
      }
    }).then(res => console.log(res)).catch(err => console.log(err))
  }

}