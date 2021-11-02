var express = require('express')
var router = express.Router()

const User = require('../db/entities/user')
const ddUser = require('../db/entities/dd-user')
const zzdUser = require('../db/entities/zzd-user')
const Group = require('../db/entities/group')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')
const zzdLogin = require('../model/zzd-login')

/* GET user listing. */
router.post('/zzdLogin', async function (req, res, next) {
  try {
    let {code} = req.body
    const zzdUserInfo = await zzdLogin(code).then(res => res).catch(console.log)
    if (!zzdUserInfo) {
      // response.responseFailed(res, '获取浙政钉用户信息失败')
      return
    }

    // success
    let uid = zzdUserInfo.accountId
    let dbRes = await zzdUser.findByUid(uid)
    let dbUser = dbRes.results[0]
    if(!dbUser) {
      // 非授权用户
      response.responseSuccess(zzdUserInfo, res, '非授权用户', undefined, 'waitAuth')
      return
    }
    let groupRes = await Group.findByCode(dbUser.group_code)
    let group = groupRes ? groupRes.results[0] : ''
    // dd auth success
    if (dbUser && group) {
      let auth = dbUser.auth || ''
      let resInfo = {
        name: dbUser['name'],
        code: group['code'],
        permission: group['permission'],
        role: group['role'],
        cluster: group['cluster'],
        uid: dbUser['uid'],
      }
      let token = Token.en(resInfo)
      let menu = await Rights(resInfo.code, auth)
      response.status = true
      response.msg = 'success'
      response.data = {
        name: resInfo.name,
        role: resInfo.role,
        cluster: resInfo.cluster,
        token,
        rights: menu
      }
      res.send(response)
    } else {
      response.responseFailed(res)
    }
  } catch
    (e) {
    console.log(e.message)
  }
})

router.get('/loginOut', function (req, res, next) {
  res.send('loginOut success')
})


module.exports = router
