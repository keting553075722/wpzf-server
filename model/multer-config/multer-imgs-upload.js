/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/8
 */
const multer = require('multer')
const storageFile = multer.memoryStorage()
exports.imageUpload = multer({ storage: storageFile }).any()
