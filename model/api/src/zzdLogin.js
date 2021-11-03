/**
 * @name: zzdLogin
 * @author: zzhe
 * @date: 2021/10/30 11:24
 * @description: zzdLogin
 * @update: 2021/10/30 11:24
 */

const {api} = require('./myaxios')

const appkey = 'wpzf_dingoa-JFyyCo81V2EYyEVN3m'
const appsecret = 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg'
/**
 *
 * @param appkey 应用的唯一标识key
 * @param appsecret 应用的密钥
 * @returns {accessToken,expiresIn}
 */
const gettoken = (appkey, appsecret) => {
    return api({
        url: '/gettoken.json',
        method: 'get',
        params: {
            appkey: appkey,
            appsecret: appsecret
        }
    })
}

/**
 * 获取用户信息
 * @param access_token 调用接口凭证，应用access_token
 * @param code 用户授权的临时授权码code，只能使用一次；在前面步骤中跳转到redirect_uri时会追加code参数
 * @returns {userinfo}
 */
const getuserinfo = (access_token, code) => {
    return api({
        url: '/rpc/oauth2/getuserinfo_bycode.json',
        method: 'post',
        params: {
            access_token: access_token,
            code: code
        }
    })
}


const ddLogin = async (code) => {
    let gettokenRes = await gettoken(appkey, appsecret)
    let {accessToken} = gettokenRes
    if(accessToken) {
        let getuserinfoRes = await getuserinfo(accessToken, code)
        let {content} = getuserinfoRes
    }
}

module.exports = ddLogin
