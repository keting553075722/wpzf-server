/**
 * @Description: 文件上传
 * @author zzh
 * @createTime 2021/4/7
 */
// const moment = require('moment')
// const multerFilesUpload = require('multer')
const multer = require('multer')
// const path = require('path')
// const fs = require('fs')
// const mkdirp = require('mkdirp')
// const Token = require('../utils/token')
// const storage = multerFilesUpload.diskStorage({
//     // 文件存储路径
//     destination: function (req, file, callback) {
//
//         let filePath = path.join(__dirname, "../../resources/uploads/files/") + curTable + '/' + moment().format("YYYY-MM-DD")
//         // console.log('upload file path : ', filePath)
//         try {
//             // mkdirSync只能创建一级目录
//             if (!fs.existsSync(filePath)) {
//                 mkdirp(filePath).then(made => {
//                     callback(null, filePath)
//                 })
//             } else {
//                 callback(null, filePath)
//             }
//         } catch (err) {
//             console.error(err)
//         }
//     },
//     // 文件名
//     filename: function (req, file, callback) {
//         let  user = Token.de(req.headers.authorization)
//         callback(null, `${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`);
//     }
// })
//
// module.exports = multerFilesUpload({storage})

const storageFile = multer.memoryStorage()
exports.excelUpload = multer({ storage: storageFile }).single('file')


