/**
 * @Description:
 * @author zzh
 * @createTime 2021/6/3
 */
const mkdirp = require('mkdirp')
const fs = require('fs')

async function mkDeepDir(filePath) {
    let fpath = ''
    if (!fs.existsSync(filePath)) {
        const {made} = await mkdirp(filePath)
        fpath = made
    } else {
        fpath = filePath
    }
    return fpath
}

module.exports = mkDeepDir
