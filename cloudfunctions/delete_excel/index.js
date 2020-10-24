// 云函数入口文件
//删除功能，尚未测试

const cloud = require('wx-server-sdk')

cloud.init({
  env: 'file-3gcxwtoae61be7b7'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  var fileName = event.fileName
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve(db.collection("demo").where({
          title: fileName
        }).get())
      }, 200)
    }).then(res => {
      console.log(res)
      var creater_id = res.data[0].creater_id
      var list = res.data[0].content
      for (let i in list) {
        //删除toMeFile和myCreat中的对应数据
        if (list[i][2] == creater_id) {
          db.collection("user").where({
            sno: list[i][2]
          }).update({
            data: {
              myCreat: _.pull({
                title: fileName
              }),
              toMeFile: _.pull({
                title: fileName
              })
            }
          })
        } else {
          //删除toMeFile中的对应数据
          db.collection("user").where({
            sno: list[i][2]
          }).update({
            data: {
              toMeFile: _.pull({
                title: fileName
              })
            }
          })
        }
      }
      //删除demo中的内容
      setTimeout(() => {
        db.collection("demo").where({
          title: fileName
        }).remove()
      }, 200)
    }).then(res => console.log(res))
    .catch(err => console.log(err))
}