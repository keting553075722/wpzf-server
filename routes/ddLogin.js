var express = require('express')
var router = express.Router()

const User = require('../db/entities/user')
const ddUser = require('../db/entities/dd-user')
const Rights = require('../model/build-rights')
const Token = require('../model/token')
const response = require('../model/response-format')
const zzdLogin = require('../model/zzd-login')

/* GET user listing. */
router.get('/ddLogin', async function (req, res, next) {
    try {
        let {code} = req.query
        const ddLoginRes = await zzdLogin(code)
        // success
        if(ddLoginRes && ddLoginRes.success && ddLoginRes.content.data) {
            const uid = ddLoginRes.content.data.accountId
            const nickNameCn = ddLoginRes.content.data.nickNameCn
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
                response.responseFailed(res, '您的浙政钉账户未授权,请联系管理员进行授权')
            }
        } else {
            response.responseFailed(res, '请使用浙政钉扫码!')
        }
    } catch (e) {
        console.log(e.message)
    }
})

router.get('/loginOut', function (req, res, next) {
    res.send('loginOut success')
})


module.exports = router
