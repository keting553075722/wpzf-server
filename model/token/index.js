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
            let tokenKey = jwt.verify(obj, str)
            return {
                status: 'success',
                tokenKey
            }
        } catch (e) {
            return {
                status: 'failed',
            }
        }

    }
}
