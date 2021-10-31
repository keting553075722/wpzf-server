/**
 * @name: index
 * @author: zzhe
 * @date: 2021/10/30 17:04
 * @description: index
 * @update: 2021/10/30 17:04
 */

const https = require('https')
const request = require('request')
const domain = 'https://openplatform.dg-work.cn'
// const domain = 'openplatform-pro.ding.zj.gov.cn'
const appkey = 'wpzf_dingoa-JFyyCo81V2EYyEVN3m'
const appsecret = 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg'
const getRequestHeader = require('./build-header')
const header = getRequestHeader('GET', '/gettoken.json')

const getToken = () => {
    return new Promise(((resolve, reject) => {
        request(`${domain}/gettoken.json`, {
            headers: getRequestHeader('GET', '/gettoken.json')
        }, (err, res, body) => {
            if (err) {
                return reject(err)
            }
            resolve(JSON.parse(body))
        })
    }))
}
// const axios = require('axios')
// const api = axios.create({
//     baseURL : 'https://openplatform.dg-work.cn'
// })
// api.interceptors.request.use(config => {
//
//     config.headers = getRequestHeader('POST', '/rpc/oauth2/getuserinfo_bycode.json')
//     return config
// })
//
//
// /**
//  * 获取用户信息
//  * @param access_token 调用接口凭证，应用access_token
//  * @param code 用户授权的临时授权码code，只能使用一次；在前面步骤中跳转到redirect_uri时会追加code参数
//  * @returns {userinfo}
//  */
// const getuserinfo = (access_token, code) => {
//     return api({
//         url: '/rpc/oauth2/getuserinfo_bycode.json',
//         method: 'post',
//         data: {
//             access_token: access_token,
//             code: code
//         }
//     })
// }

const getUserInfo = (token, temp_code) => {
    return new Promise((resolve, reject) => {
        console.log('token', token)
        console.log('temp_code', temp_code)
        request({
            url: `${domain}/rpc/oauth2/getuserinfo_bycode.json`,
            // url: `http://121.196.170.251:3999/user/login`,
            method: 'post',
            headers: getRequestHeader('POST', '/rpc/oauth2/getuserinfo_bycode.json'),
            json: true,
            body: {
                'access_token': token,
                'code': temp_code
            }
        }, (err, res, body) => {
            if (err) {
                return reject(err)
            }
            resolve(body)
        })
    })
}

async function get(code) {
    let getTokenRes = await getToken()
    let token
    if (getTokenRes && getTokenRes.success) {
        token = getTokenRes.content.data.accessToken
    }
    if (!token || !code) return false
    let getUserInfoRes = await getUserInfo(token, code)
    console.log('getUserInfoRes',getUserInfoRes)
    return getUserInfoRes
}
// get('44444')
module.exports = get

