//上传名单所用云函数
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'file-3gcxwtoae61be7b7'
})
const xlsx = require('node-xlsx')
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const creater_id = event.creater_id
  var creater_name = event.creater_name
  var fileID = event.fileID
  var fileName = event.fileName
  var deadline = event.deadline
  //1. 通过fileID下载云存储里面的文件
  const re = await cloud.downloadFile({
    fileID: fileID
  })
  const buffer = re.fileContent

  //2.解析文件里面的数据
  var sheets = xlsx.parse(buffer) //获取到所有的sheets
  //建立文件索引（表题、表头、截止时间）
  var sheetData = sheets[0]['data']
  //获取表头
  var header = sheetData[1]
  //获取学工号
  var idList = Array.from({
      length: sheetData.length - 2
    },
    (_c, i) => sheetData[i + 2][1]
  )
  var nameList = Array.from({
      length: sheetData.length - 2
    },
    (_t, j) => sheetData[j + 2][2]
  )
  //获取表格主体内容，并在第一列插入false，表示未提交  
  var content = Array.from({
      length: sheetData.length - 2
    },
    (_c, i) => {
      sheetData[i + 2].unshift(false)
      return sheetData[i + 2]
    })
  console.log(sheets[0])
  //链式调用
  return new Promise((resolve, reject) => {
      resolve(db.collection("demo").where({
        title: fileName
      }).get())
    })
    .then(res => {
      var t = res.data.length
      console.log(res.data.length)
      if (t != 0) {
        throw new Promise(() => {})
      } else {
        return Promise.resolve(1)
      }
      })
      .then(() => {
        //向demo中插入该表格的数据及内容
        return new Promise((resolve) => {
          console.log("顺序二 下")
          resolve(db.collection("demo").add({
            data: {
              title: fileName,
              header: header,
              content: content,
              deadline: deadline,
              creater_id: creater_id,
              isActive: "true"
            }
          }))
        })
      }).
      then(()=>{
        return new Promise((resolve)=>resolve(db.collection("demo").where({
          title: fileName
        }).get()))
      }).
      then(getId => {
        let sid = getId.data[0]._id
      //向须填写者的档案中加入该文件名，初始化为false，即未提交
      const promise1 = new Promise((resolve) => {
        for (let j in idList) {
          db.collection("user").where({
            sno: idList[j]
          }).get().then(res => {
            if (res.data.length != 0) {
              db.collection("user").where({
                sno: idList[j]
              }).update({
                data: {
                  toMeFile: _.push(sid)
                }
              })
              if(res.data[0]._openid){
                let openid = res.data[0]._openid
                cloud.openapi.subscribeMessage.send({
                  touser: openid,
                  page: 'pages/home/index/index',
                  miniprogram_state: 'developer',
                  data: {
                    thing1: {
                      value: fileName //问卷名称
                    },
                    thing2: {
                      value: "注意截止时间" //温馨提示
                    },
                    thing3: {
                      value: creater_name//联系人
                    }
                  },
                  template_id: 'EdjVVFMnmn79C4xEwwV13JO2x3viBSyDOikvP3fplKA' //模板ID
                })
              }
            } else {
              console.log(j, idList[j], nameList[j])
              // console.log(idList,nameList)
              db.collection("user").add({
                data: {
                  sno: idList[j],
                  name: nameList[j],
                  toMeFile: [sid],
                }
              }).then(res => console.log(res))
            }
          })
        }
      });
      const promise2 = new Promise((resolve) => {
        db.collection("user").where({
          sno: creater_id
        }).update({
          data: {
            myCreat: _.push(sid)
          }
        })
      })
      Promise.all([promise1, promise2]).then(
        res => {
          console.log(res)
        })
    })
    .then(res => {
      console.log(res)
      return 1
    })
    .catch(err => {
      console.log(err)
      return 2
    })
}