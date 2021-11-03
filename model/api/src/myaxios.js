const axios = require('axios')
const {serverIp , serverMac, ddConfig} = require('../../../deploy-config/src/config')
// const {appid, appkey, appsecret, requesturl} = ddConfig
const appkey = 'wpzf_dingoa-JFyyCo81V2EYyEVN3m'
const appsecret = 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg'
const moment = require('moment')
const getRandom = require('../../utils/random4')
const crypto = require('crypto')
const HmacSha256 = require('crypto-js/hmac-sha256') ;
const Base64 = require('crypto-js/enc-base64');
const ip = require('ip')

/**
 * Convert the given string to byte array
 *
 * @param {string} str the string to be converted to byte array
 * @returns {string}
 */
const getSignature = (method, timestamp, nonce, url_info) => {

    const bytes_to_sign = `${method}\n${timestamp}\n${nonce}\n${url_info}`
    // const bytes_to_sign = 'GET\n2021-10-30T16:06:48.4848+08:00\n16355812081293902\n/gettoken.json'
    // const bytes_to_sign = 'GET\n2021-10-30T16:11:20.242000+08:00\n16355814802424992\n/gettoken.json'
    // let strs = []
    // let params = config.method == "get" ? config.params : config.data
    // let queryStrs = []
    // for(let paramsKey in params) {
    //     queryStrs.push(paramsKey + '=' + params[paramsKey])
    // }
    // queryStrs.sort()
    // let queryStr = queryStrs.join('&')
    // queryStr = queryStr.substr(0, queryStr.length-1)
    // strs.push(config.method.toUpperCase() , config.headers['X-Hmac-Auth-Timestamp'] , config.headers['X-Hmac-Auth-Nonce'] , config.url , queryStr)
    // let strsss = strs.join('\n')
    // 加密
    // const bytesToSign = str2bytes(strsss)
    const SecretKey = appsecret
    const hmac = crypto.createHmac('sha256', SecretKey);
    hmac.update(bytes_to_sign);
    return hmac.digest().toString('base64')
}



const getTimeStamp = () => {
    return moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS+08:00')
}

const api = axios.create({
    baseURL : 'https://openplatform.dg-work.cn'
})


api.interceptors.request.use( config => {
    let ipAddress = ip.address()
    // let ipAddress = '127.0.0.1'
    let mac = serverMac
    let timestamp = getTimeStamp()
    let version = '1.0'
    let nonce = Date.now().toString() + getRandom()
    let apikey = appkey
    let signature = getSignature(config.method.toUpperCase(), timestamp, nonce, config.url)
    let headers = {
        'X-Hmac-Auth-Timestamp': timestamp,
        'X-Hmac-Auth-Version': version,
        'X-Hmac-Auth-Nonce': nonce,
        'apiKey': apikey,
        'X-Hmac-Auth-Signature': signature,
        'X-Hmac-Auth-IP': ipAddress,
        'X-Hmac-Auth-MAC': mac
    }
    config.headers = headers

    return  config
})

module.exports = {api}





