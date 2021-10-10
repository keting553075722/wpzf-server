
const {appid, appsecret, REDIRECT_URI} = require('../../../config.json').ddConfig

const axios = require('axios')
const api = axios.create({
    baseURL: 'https://oapi.dingtalk.com/sns'
})

//钉钉接口
const gettoken = params => {
    return api({
        url: '/gettoken',
        method: 'get',
        params
    });
};
//获取授权码
const get_persistent_code = ({ access_token, tmp_auth_code }) => {
    return api({
        url: '/get_persistent_code?access_token=' + access_token,
        method: 'post',
        data: {
            tmp_auth_code
        }
    });
};
//获取用户授权的SNS_TOKEN
const get_sns_token = ({ access_token, openid, persistent_code }) => {
    return api({
        url: '/get_sns_token?access_token=' + access_token,
        method: 'post',
        data: {
            openid,
            persistent_code
        }
    });
};
//用户信息
const getuserinfo = params => {
    return api({
        url: '/getuserinfo',
        method: 'get',
        params
    });
};

/**
 * 钉钉扫码登录接口的请求头
 * @param req
 * @returns {PromiseLike<T>}
 */
const ddLogin = (req) => {
    const { tmp_auth_code } = req.query
    return gettoken({ appid, appsecret })
        .then(response => {
            const { access_token } = response.data
            return get_persistent_code({
                access_token,
                tmp_auth_code
            })
        })
        .then(response => {
            // console.log(response)
            const access_token = response.config.url.split('=')[1]
            const { openid, persistent_code } = response.data
            return get_sns_token({ openid, persistent_code, access_token })
        })
        .then(response => {
            const { sns_token } = response.data
            return getuserinfo({ sns_token })
        })
}


module.exports =  ddLogin



