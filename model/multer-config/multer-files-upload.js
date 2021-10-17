/**
 * @Description: 文件上传
 * @author zzh
 * @createTime 2021/4/7
 */
const multer = require('multer')
const storageFile = multer.memoryStorage()
exports.fileUpload = multer({ storage: storageFile }).single('file')


