/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/29
 */

const jwt = require('jsonwebtoken')
let str = '6FGK908'
module.exports = {
    en(obj) {
        return jwt.sign(obj, str)
    },
    de(obj) {
        try {
            return jwt.verify(obj, str)
        } catch (e) {
            return undefined
        }
    }
}
