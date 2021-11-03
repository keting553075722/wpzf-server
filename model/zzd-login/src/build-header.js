/**
 * @name: build-header
 * @author: zzhe
 * @date: 2021/10/30 17:08
 * @description: build-header
 * @update: 2021/10/30 17:08
 */

const {serverIp , serverMac, ddConfig} = require('../../../deploy-config')
const {appkey, appsecret} = ddConfig
// const appkey = 'wpzf_dingoa-JFyyCo81V2EYyEVN3m'
// const appsecret = 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg'
const moment = require('moment')
const getRandom = require('../../utils/random4')
const crypto = require('crypto')
const ip = require('ip')


const transferData2Query = (params = {}) => {
    let urlInfo = ''
    if(JSON.stringify(params) !== '{}') {
        let sortKeys = Object.keys(params).sort()
        for (let i = 0; i < sortKeys.length; i++) {
            let key = sortKeys[i]
            urlInfo += `${key}=${params[key]}`
            i < sortKeys.length - 1 && (urlInfo += `&`)
        }
    }
    return urlInfo
}


/**
 * Convert the given string to byte array
 *
 * @param {string} str the string to be converted to byte array
 * @returns {string}
 */
const getSignature = (method, timestamp, nonce, url_path, params = {}) => {
    let bytes_to_sign = `${method}\n${timestamp}\n${nonce}\n${url_path}`
    let urlQuery = transferData2Query(params)
    urlQuery && (bytes_to_sign += `\n${urlQuery}`)

    const SecretKey = appsecret
    const hmac = crypto.createHmac('sha256', SecretKey);
    hmac.update(bytes_to_sign);
    return hmac.digest().toString('base64')
}

const getTimeStamp = () => {
    return moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS+08:00')
}

const getSignHeader = (method, urlPath, data) => {
    let ipAddress = ip.address()
    let mac = serverMac
    let timestamp = getTimeStamp()
    let version = '1.0'
    let nonce = Date.now().toString() + getRandom()
    let apikey = appkey
    let signature = getSignature(method.toUpperCase(), timestamp, nonce, urlPath, data)
    let headers = {
        'X-Hmac-Auth-Timestamp': timestamp,
        'X-Hmac-Auth-Version': version,
        'X-Hmac-Auth-Nonce': nonce,
        'apiKey': apikey,
        'X-Hmac-Auth-Signature': signature,
        'X-Hmac-Auth-IP': ipAddress,
        'X-Hmac-Auth-MAC': mac
    }
    return  headers
}



module.exports = {getSignHeader, transferData2Query}
