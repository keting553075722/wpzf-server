/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/8
 */
// const moment = require('moment')
// const multer = require('multer')
// const path = require('path')
// const fs = require('fs')
// const getCityNames = require('../utils/getNames')
// const mkdirp = require('mkdirp')
// const Token = require('../token')
//
// const storage = multer.diskStorage({
//     // 文件存储路径
//     // 只有县级可以举证上传，图片存储路径为resources/evidence/+市+县+图斑编号+attachments/
//     // 不是县级上传照片会出错
//     destination: function (req, file, callback) {
//         try {
//             let user = Token.de(req.headers.authorization)
//             let tableName = file.fieldname.split('-')[1]
//             let TBBH = file.fieldname.split('-')[0]
//             let cityNames = getCityNames(user.code)
//             // 绝对路径
//             let basePath = path.join(__dirname, "../../resources/evidence")
//             let filePath = `${basePath}/${tableName}/${cityNames['CMC']}/${cityNames['XMC']}/${TBBH}/attachments`
//             //console.log('attachments path : ', filePath)
//             // mkdirSync只能创建一级目录
//             if (!fs.existsSync(filePath)) {
//                 mkdirp(filePath).then(made => {
//                     callback(null, filePath)
//                 })
//             } else {
//                 callback(null, filePath)
//             }
//         } catch (e) {
//             console.log(e.message)
//         }
//     },
//     // 文件名格式,图斑号+用户名+上传日期
//     filename: function (req, file, callback) {
//         try {
//             let user = Token.de(req.headers.authorization)
//             let TBBH = file.fieldname.split('-')[0]
//             callback(null, `${TBBH}--${user.name}--${moment().format("YYYY-MM-DD HH时mm分ss秒")}--${file.originalname}`);
//         } catch (e) {
//             console.log(e.message)
//         }
//     }
// })
//
// module.exports = multer({storage})
const multer = require('multer')

const storageFile = multer.memoryStorage()
exports.attachmentUpload = multer({ storage: storageFile }).any()
