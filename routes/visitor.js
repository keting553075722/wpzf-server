/**
 * @name: applyForVisit
 * @author: zzhe
 * @date: 2021/11/2 15:52
 * @description: applyForVisit
 * @update: 2021/11/2 15:52
 */

var express = require('express');
var router = express.Router();
const Token = require('../model/token')
const currentTime = require('../model/get-current-time')
const Visitor = require('../db/entities/visitor')
const ZZDUser = require('../db/entities/zzd-user')
const {getRandom} = require('../model/utils/random')
const response = require('../model/response-format')

/* GET user listing. */
router.get('/get', async function (req, res, next) {
  try {
    // 路由权限判定，不怕贼偷，就怕贼惦记
    let getVisitorRes =await Visitor.findAll().then(res=>res).catch(console.log)
    getVisitorRes && getVisitorRes.results ? response.responseSuccess(getVisitorRes.results, res) : response.responseFailed(res)
  } catch (e) {
    console.log('/visitor/get', e.message)
    response.responseFailed(res)
  }
});

router.post('/applyforvisit', async function (req, res, next) {
  try {
    // post请求参数存在body中
    let applyUser = req.body
    applyUser = Object.assign(applyUser, {'_is_allow' : '0', 'apply_time': currentTime()})
    let visitorAddRes =await Visitor.add(applyUser).then(res=>res).catch(console.log)
    visitorAddRes && visitorAddRes.results ? response.responseSuccess(visitorAddRes.results.message, res) : response.responseFailed(res)
  } catch (e) {
    console.log('/visitor/applyforvisit', e.message)
    response.responseFailed(res)
  }
});

router.post('/visitorauthorization',async function (req, res, next) {
  try {
    let token = req.headers.authorization
    let {name} = Token.de(token)
    const {accountId, group_code, auth, givePwd} = req.body
    let visitorInfoRes =await Visitor.findByAccountId(accountId).then(res=>res).catch(console.log)
    if(visitorInfoRes && visitorInfoRes.results.length){
      let visitorInfo = visitorInfoRes.results[0]
      const zzduser = {
        uid:visitorInfo.accountId,
        name:visitorInfo.nickNameCn,
        // password: givePwd ? group_code + '@' +getRandom() : '',
        password: 'Password@2021',
        group_code:group_code,
        auth: auth || '',
        authorizer: name || '',
        last_update_time: currentTime()
      }
      let zzdUserAddRes = await ZZDUser.add(zzduser)
      let visitorRemoveRes = await Visitor.removeByAccountId(accountId)
      if(zzdUserAddRes.results && visitorRemoveRes.results) {
        response.responseSuccess({}, res)
      } else {
        response.responseFailed( res)
      }
    }
  } catch (e) {
    console.log('/visitor/visitorauthorization', e.message)
    response.responseFailed(res)
  }
});

router.get('/deletevisitor',async function (req, res, next) {
  try {
    const {accountId} = req.query
    let visitorAllowRes =await Visitor.removeByAccountId(accountId).then(res=>res).catch(console.log)
    visitorAllowRes && visitorAllowRes.results ? response.responseSuccess(visitorAllowRes.results.message, res) : response.responseFailed(res)
  } catch (e) {
    console.log('/visitor/deletevisitor', e.message)
    response.responseFailed(res)
  }
});

module.exports = router;
