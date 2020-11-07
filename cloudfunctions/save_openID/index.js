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

  return db.collection("user").where({
    _openid: wxContext.OPENID
  }).get().then(res => {
    //已经注册
    return [res.data[0].sno, wxContext.OPENID, res.data[0].name]
  }).catch(err => {
    //尚未注册
    console.log(err)
    return [-1, wxContext.OPENID,""]
  })
}