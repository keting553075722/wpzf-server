/**
 * @name: index
 * @author: zzhe
 * @date: 2021/10/30 17:04
 * @description: index
 * @update: 2021/10/30 17:04
 */

const {domain} = require('../../../deploy-config').ddConfig
const {getSignHeader, transferData2Query} = require('./build-header')
const axios = require('axios')

const api = axios.create({
  baseURL: domain
})

api.interceptors.request.use(config => {
  let data = config.data || config.params || {}
  let method = config.method
  let url = config.url
  let urlQuery = transferData2Query(data)
  config.headers = getSignHeader(method, url, data)
  config.data = urlQuery
  return config
})

const getToken = () => {
  return api({
    url: '/gettoken.json',
    method: 'post'
  })
}

/**
 * 获取用户信息
 * @param access_token 调用接口凭证，应用access_token
 * @param code 用户授权的临时授权码code，只能使用一次；在前面步骤中跳转到redirect_uri时会追加code参数
 * @returns {userinfo}
 */
const getUserInfo = (access_token, code) => {
  return api({
    url: '/rpc/oauth2/getuserinfo_bycode.json',
    method: 'post',
    data: {
      access_token: access_token,
      code: code
    }
  })
}

async function get(code) {
  let getTokenRes = await getToken()
  let token
  if (getTokenRes && getTokenRes.data && getTokenRes.data.success) {
    token = getTokenRes.data.content.data.accessToken
  }
  if (!token || !code) return false
  let getUserInfoRes = await getUserInfo(token, code)
  let zzdUserInfo
  if (getUserInfoRes && getUserInfoRes.data && getUserInfoRes.data.success) {
    let {accountId, lastName, clientId, realmId, tenantName, realmName, namespace, tenantId, nickNameCn, tenantUserId, account} = getUserInfoRes.data.content.data
    zzdUserInfo = {accountId, lastName, clientId, realmId, tenantName, realmName, namespace, tenantId, nickNameCn, tenantUserId, account}
  }

  return  zzdUserInfo ? zzdUserInfo : false
}

module.exports = get

