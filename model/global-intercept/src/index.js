/**
 * @Author : zzhe
 * @Date : 2021/10/22 15:29
 * @Description : index
 */
const getUrl = require('../../utils/getUrl')
const Token = require('../../token')
const response = require('../../response-format')
const permissionMap = require('../../../db/properties/permission-mapper')['role']
/**
 *
 * @param reqUrl
 * @param permission
 * @param auth
 * @returns {boolean}
 */
module.exports = function (req, res, next) {
    const loginUrls = ['/dd/ddLogin', 'user/login']
    let url = getUrl(req.method, req.url)
    if(loginUrls.includes(url)) {
        next() // 登录放行
    } else {
        let token = req.headers.authorization
        if(!token) {
            response.responseFailed(res, '服务器拒绝了您的访问请求')
            return false
        }
        let user = Token.de(token)
        // 根据用户组区分是否有权访问接口
        let realRole = permissionMap[user.permission]
        //todo 需要根据接口做请求管理
        next()
    }
}