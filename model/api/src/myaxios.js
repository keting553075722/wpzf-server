const axios = require('axios')
const {serverIp , serverMac, ddConfig} = require('../../../deploy-config')
const {appid, appkey, appsecret, requesturl} = ddConfig
const moment = require('moment')
const {ramdom4} = require('../../utils/random4')
const crypto = require('crypto')
const HmacSha256 = require('crypto-js/hmac-sha256') ;
const Base64 = require('crypto-js/enc-base64');
const ip = require('ip')

const getSignature = (config) => {
    let strs = []
    let params = config.method == "get" ? config.params : config.data
    let queryStrs = []
    for(let paramsKey in params) {
        queryStrs.push(paramsKey + '=' + params[paramsKey])
    }
    queryStrs.sort()
    let queryStr = queryStrs.join('&')
    queryStr = queryStr.substr(0, queryStr.length-1)
    strs.push(config.method.toUpperCase() , config.headers['X-Hmac-Auth-Timestamp'] , config.headers['X-Hmac-Auth-Nonce'] , config.url , queryStr)
    let strsss = strs.join('\n')
    // 加密
    const bytesToSign = strsss
    const SecretKey = appsecret
    const hmac = crypto.createHmac('sha256', SecretKey);
    // const obj = bytesToSign.toBytes('utf8')
    hmac.update(bytesToSign);
    let Hmac = hmac.digest();
    const Authorization = Hmac.toString('base64')
    console.log(Authorization)
    return Authorization
}

const getTimeStamp = () => {
    let time = moment().format('YYYY-MM-DD$HH:mm:ss.sss+08:00')
    let tt = time.replace('$','T')
    return tt
}

const api = axios.create({
    baseURL : 'https://openplatform.dg-work.cn'
})


api.interceptors.request.use( config => {
    config.headers['X-Hmac-Auth-IP'] = ip.address()
    config.headers['X-Hmac-Auth-MAC'] = serverMac
    config.headers['X-Hmac-Auth-Timestamp'] = getTimeStamp()
    config.headers['X-Hmac-Auth-Version'] = '1.0'
    config.headers['X-Hmac-Auth-Nonce'] = Date.now().toString() + ramdom4
    config.headers['apikey'] = appkey
    config.headers['X-Hmac-Auth-Signature'] = getSignature(config)

    return  config
})

module.exports = {api}





