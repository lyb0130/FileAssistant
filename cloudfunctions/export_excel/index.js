// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})

const db = cloud.database()
const xlsx = require('node-xlsx')

// 云函数入口函数
exports.main = async (event, context) => {
  var fileName = event.fileName
  let allData = []

  return db.collection("demo").where({
    title: fileName
  }).get().then(res => {
    console.log("步骤三上")
    //按序号排序
    let userData = res.data[0].content.sort(function (a, b) {
      return a[1] - b[1]
    })
    //存储
     allData= Array.from({
        length: userData.length
      },
      (_, i) => userData[i].slice(1)
    )
    allData.unshift(res.data[0].header)

    //3，把数据保存到excel里
    var buffer = xlsx.build([{
      name: 'Sheet1',
      data: allData
    }])

    //4，把excel文件保存到云存储里
    console.log("步骤三下")
    return cloud.uploadFile({
      cloudPath: "导出：" + fileName,
      fileContent: buffer //excel二进制文件
    })
  }).catch(err => {
    console.log(err)
    return err
  })
}
    //表属性
    //将键"_id"替换为"学工号"
    // userData[r]["学工号"] = userData[r]["_id"]
    // delete userData[r]["_id"]