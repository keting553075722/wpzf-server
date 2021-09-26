var express = require('express');
var router = express.Router();

const User = require('../db/entities/user')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')

/* GET user listing. */
router.post('/login', async function (req, res, next) {
    // post请求参数存在body中
    let user = req.body
    // 数据库的操作
    let dbRes = await User.find(user)
    let dbUser = dbRes.results[0]
    if (dbUser) {
        let resInfo = {
            name: dbUser['name'],
            code: dbUser.code,
            permission: dbUser.permission,
            cluster: dbUser.cluster
        }
        let token = Token.en(resInfo)
        response.status = true
        response.msg = 'success'
        response.data = {
            name: resInfo.name,
            role: resInfo.role,
            token,
            rights: Rights(resInfo.code)
        }
    }
    res.json(response);
});

router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success');
});


module.exports = router;
