var express = require('express');
var router = express.Router();

const User = require('../db/entities/uesr')
const Rights = require('../model/build-rights')
const Token = require('../model/token')

const response = {
    status: false,
    msg: '失败',
    data: {}
}
/* GET user listing. */
router.post('/login', function (req, res, next) {
    // post请求参数存在body中
    let user = req.body
    // 数据库的操作
    User.find(user, function (tag, user) {
        response.status = tag
        if (tag) {
            let token = Token.en({
                name: user.name,
                code: user.code,
                permission: user.permission,
                cluster:user.cluster
            })
            response.msg = '成功'
            response.data = {
                name: user.name,
                role: user.role,
                token,
                rights:Rights(user.code)
            }
        }
        res.json(response);
    })
});

router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success');
});



module.exports = router;
