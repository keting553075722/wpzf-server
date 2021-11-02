var express = require('express');
var router = express.Router();

// const User = require('../db/entities/user')
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


router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success');
});

router.post('/setpwd',async function (req, res, next) {
    try {
        let {uid, password} = req.body
        let setPwdRes =await User.setPassword(uid, password)
        setPwdRes && setPwdRes.results ? response.responseSuccess(setPwdRes.results.message, res) : response.responseFailed(res)

    } catch (e) {
        console.log('/user/setpwd', e.message)
        response.responseFailed(res)
    }
});


module.exports = router;
