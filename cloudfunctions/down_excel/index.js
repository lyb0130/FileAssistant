//功能：访问[db_name]值命名的数据库，查找关键词[keyword]的对应值为[value]的数据（注：在此，以[a]表示变量a的值）
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_EN
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var keyword = event.keyword
  var value = event.value
  var db_name = event.db_name
  console.log(value)
  console.log(keyword)
  console.log(db_name)
  return db.collection(db_name).where({
    [keyword]: value
  }).get()
}