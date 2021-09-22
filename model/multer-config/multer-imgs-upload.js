/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/8
 */
const moment = require('moment')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const getCityNames = require('../utils/getNames')
const mkdirp = require('mkdirp')
const Token = require('../token')
const storage = multer.diskStorage({
  // 文件存储路径
  // 只有县级可以举证上传，图片存储路径为resources/evidence/+市+县+图斑编号+imgs/
  // 不是县级上传照片会出错
  destination: function (req, file, callback) {
    console.log(file)
    let user = Token.de(req.headers.authorization).tokenKey
    let TBBH = req.query.TBBH ? req.query.TBBH : file.fieldname.split('-')[0]
    let tableName = file.fieldname.split('-')[1] ? file.fieldname.split('-')[1] : req.query.tableName
    let cityNames = getCityNames(user.code)
    // 绝对路径
    let basePath = path.join(__dirname, "../../resources/evidence")

    let filePath = `${basePath}/${tableName}/${cityNames['CMC']}/${cityNames['XMC']}/${TBBH}/imgs`
    console.log('imgs path : ', filePath)
    // 异步写法，处理多文件上传时出错，无法正确判断
    // fs.exists(filePath, (exists) => {
    //     if (exists) {
    //         console.log(filePath,"文件夹已存在");
    //
    //     } else {
    //         console.log(filePath,"文件夹不存在");
    //         // 创建文件夹
    //         fs.mkdirSync(filePath)
    //     }
    //     callback(null, filePath)
    // });

    try {
      // mkdirSync只能创建一级目录
      if (!fs.existsSync(filePath)) {
        mkdirp(filePath).then(made => {
          callback(null, filePath)
        })
      } else {
        callback(null, filePath)
      }
    } catch (err) {
      console.error(err)
    }
  },
  // 文件名格式,图斑号+用户名+上传日期
  filename: function (req, file, callback) {
    let user = Token.de(req.headers.authorization).tokenKey
    let TBBH = req.query.TBBH ? req.query.TBBH : file.fieldname.split('-')[0]
    callback(null, `${TBBH}--${user.name}--${moment().format("YYYY-MM-DD HH时mm分ss秒")}--${file.originalname}`);
  }
})

module.exports = multer({ storage })
