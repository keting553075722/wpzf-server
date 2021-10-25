var express = require('express')
var router = express.Router()

const User = require('../db/entities/user')
const ddUser = require('../db/entities/dd-user')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')
const ddLogin = require('../model/ddLogin')

/* GET user listing. */
router.get('/ddLogin', async function (req, res, next) {
    try {

        const ddLoginRes = await ddLogin(req)
        // success
        if(ddLoginRes && ddLoginRes.data.errcode == 0 && ddLoginRes.data.user_info) {
            const uid = ddLoginRes.data.user_info.unionid
            let ddUserRes = await ddUser.find( uid )
            // dd auth success
            if(ddUserRes.results.length) {
                const {group_code, name} = ddUserRes.results[0]
                const userRes = await User.find({code: group_code})
                let dbUser = userRes.results[0]
                if (dbUser) {
                    let resInfo = {
                        name: name,
                        code: group_code,
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
                        rights: menu
                    }
                }
                res.send(response)
            }
            else { // 找不到
                response.responseFailed(res, '您的钉钉账户未授权,请联系管理员进行授权')
            }
        } else {
            response.responseFailed(res, '请使用钉钉扫码!')
        }
    } catch (e) {
        console.log(e.message)
    }
})

router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success')
})


module.exports = router
