/**
 * @name: build-header
 * @author: zzhe
 * @date: 2021/10/30 17:08
 * @description: build-header
 * @update: 2021/10/30 17:08
 */

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
    const SecretKey = appsecret
    const hmac = crypto.createHmac('sha256', SecretKey);
    hmac.update(bytes_to_sign);
    return hmac.digest().toString('base64')
}

const getTimeStamp = () => {
    return moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS+08:00')
}

const getHeader = (method, urlPath) => {
    let ipAddress = ip.address()
    let mac = serverMac
    let timestamp = getTimeStamp()
    let version = '1.0'
    let nonce = Date.now().toString() + getRandom()
    let apikey = appkey
    let signature = getSignature(method.toUpperCase(), timestamp, nonce, urlPath)
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

module.exports = getHeader
