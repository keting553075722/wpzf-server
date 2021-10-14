var express = require('express');
var router = express.Router();

const User = require('../db/entities/user')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')

/* GET user listing. */
router.post('/login', async function (req, res, next) {
    try {
        // post请求参数存在body中
        let user = req.body
        // 数据库的操作
        let dbRes = await User.find(user)
        let dbUser = dbRes.results[0]

        if (dbUser) {
            let resInfo = {
                name: dbUser['name'],
                code: dbUser['code'],
                permission: dbUser['permission'],
                role: dbUser['role'],
                cluster : dbUser['cluster'],
            }
            let token = Token.en(resInfo)
            let menu = await Rights(resInfo.code)
            response.status = true
            response.msg = 'success'
            response.data = {
                name: resInfo.name,
                role: resInfo.role,
                cluster : resInfo.cluster,
                token,
                rights:menu
            }
        }
        res.send(response)
        // response.responseSuccess(response, res) // Converting circular structure to JSON
    } catch (e) {
        console.log('/user/login', e.message)
        response.responseFailed(res)
    }
});

router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success');
});


module.exports = router;
