//submit_data功能：根据标题title，在数据库demo找出对应的_id，再把提交的数据更新到以其_id命名的数据库中
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var id = event.id
  var title = event.title
  var answer = event.answer
  var indexList = event.indexList
  //将所提交的answer对象中的对应属性值更新到数据库中
  const promise1 = db.collection("demo").where({
    title: title,
    content: indexList
  }).update({
    data:{
      'content.$':answer
    }
  })
  //在user数据中改为已提交
  const promise2 = db.collection("user").where({
    sno: id,
    toMeFile: {
      title: title
    }
  }).update({
    data:{
      'toMeFile.$.IsSubmit': true,
    }      
  })

  return Promise.all([promise1,promise2])
  .then(res => {console.log(res)})
  .catch(err => console.log(err))
}