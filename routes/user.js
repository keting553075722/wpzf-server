var express = require('express');
var router = express.Router();

const User = require('../db/entities/zzd-user')
const Group = require('../db/entities/group')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')


/* GET user listing. */
router.post('/login', async function (req, res, next) {
    try {
        // post请求参数存在body中
        let {name, password} = req.body
        if(!name || !password) {
            response.responseFailed(res, '参数无效')
            return
        }
        // 数据库的操作
        let dbRes = await User.findByPwd(name, password)
        let dbUser = dbRes.results[0]
        let groupRes = await Group.findByCode(dbUser.group_code)
        let group = groupRes ? groupRes.results[0] : ''
        if (dbUser && group) {
            let auth = dbUser.auth || ''
            let resInfo = {
                name: dbUser['name'],
                code: group['code'],
                permission: group['permission'],
                role: group['role'],
                cluster : group['cluster'],
                uid : dbUser['uid'],
            }
            let token = Token.en(resInfo)
            let menu = await Rights(resInfo.code, auth)
            response.status = true
            response.msg = 'success'
            response.data = {
                name: resInfo.name,
                role: resInfo.role,
                cluster : resInfo.cluster,
                token,
                rights:menu
            }
            res.send(response)
        } else {
            response.responseFailed(res)
        }

    } catch (e) {
        console.log('/user/login', e.message)
        response.responseFailed(res)
    }
});

// todo 需要鉴权，超管接口
router.get('/getall',async function (req, res, next) {
    try {
        let dbRes = await User.findAll().then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/getall', e.message)
        response.responseFailed(res)
    }
});

// todo 需要鉴权，超管接口
router.get('/getbygroupcode',async function (req, res, next) {
    try {
        let {code} = req.query
        let dbRes = await User.findByGroupCode(code).then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/getbygroupcode', e.message)
        response.responseFailed(res)
    }
});

// todo 需要鉴权，超管接口,删除指定用户
router.get('/removeuser',async function (req, res, next) {
    try {
        let {uid} = req.query
        let dbRes = await User.removeByUid(uid).then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/removeuser', e.message)
        response.responseFailed(res)
    }
});

// todo 需要二次鉴权，超管接口
router.post('/updategroup',async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name} = Token.de(token)
        let {uid, group_code, userName} = req.body
        let dbRes = await User.updateGroup(uid, group_code, name).then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/updategroup', e.message)
        response.responseFailed(res)
    }
});

// todo 需要二次鉴权，超管接口
router.post('/updateauth',async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name} = Token.de(token)
        let {uid, auth} = req.body
        let dbRes = await User.updateAuth(uid, auth, name).then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/updateauth', e.message)
        response.responseFailed(res)
    }
});

// todo 需要二次鉴权，超管接口
router.post('/updateuserinfo',async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name} = Token.de(token)
        let {uid, group_code, auth} = req.body
        let dbRes = await User.updateUserInfo(uid, group_code, auth, name).then(res=>res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/user/updateuserinfo', e.message)
        response.responseFailed(res)
    }
});

router.post('/setpwd',async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name} = Token.de(token)
        let {uid, password} = req.body
        let setPwdRes =await User.setPassword(uid, password, name).then(res=>res).catch(console.log)
        setPwdRes && setPwdRes.results ? response.responseSuccess(setPwdRes.results.message, res) : response.responseFailed(res)

    } catch (e) {
        console.log('/user/setpwd', e.message)
        response.responseFailed(res)
    }
});


module.exports = router;
