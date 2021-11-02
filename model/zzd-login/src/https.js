/**
 * @name: https
 * @author: zzhe
 * @date: 2021/11/2 10:53
 * @description: https
 * @update: 2021/11/2 10:53
 */

const https = require('https')
const {getTokenHeader, getUserInfoHeader} = require('./build-header')

const data = function (token, temp_code) {
  return JSON.stringify({
    'access_token': token,
    'code': temp_code
  })
}

const options = {
  hostname: 'openplatform.dg-work.cn',
  port: 443,
  path: '/rpc/oauth2/getuserinfo_bycode.json',
  method: 'POST',
  headers: getTokenHeader('POST', '/rpc/oauth2/getuserinfo_bycode.json')
}

const req = https.request(options, res => {
  console.log(`状态码: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()

