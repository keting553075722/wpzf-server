// var express = require('express');
// var router = express.Router();
//
// const User = require('../db/entities/user')
// const Rights = require('../model/build-rights')
// const Token = require('../model/token')
// const response = require('../model/response-format')
// // const {appid, appkey, appsecret, requesturl} = require('../deploy-config').ddConfig
// // const axios = require('axios')
//
// const {api} = require('../model/api')
//
// //获取access_token
// const getToken = params => {
//     return api({
//         url: '/gettoken.json',
//         method: 'get',
//         params
//     });
// }
//
// // 获取临时code
// const getCode = (appId, REDIRECT_URI, tmp_auth_code) => {
//     return api({
//         url: `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appkey=${appkey}y&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${REDIRECT_URI}&loginTmpCode=${tmp_auth_code}`,
//         method: 'get'
//     });
// }
//
//
// //获取授权码
// const getPersistentCode = (access_token, tmp_auth_code) => {
//     return api({
//         url: '/get_persistent_code?access_token=' + access_token,
//         method: 'post',
//         data: {
//             tmp_auth_code: tmp_auth_code
//         }
//     });
// }
// //获取用户授权的SNS_TOKEN
// const getSnsToken = (access_token, openid, persistent_code) => {
//     return api({
//         url: '/get_sns_token?access_token=' + access_token,
//         method: 'post',
//         data: {
//             openid: openid,
//             persistent_code: persistent_code
//         }
//     });
// }
// //用户信息
// const getUserInfo = params => {
//     return api({
//         url: '/getuserinfo',
//         method: 'get',
//         params
//     });
// }
//
// //变量声明
// // const appkey = "wpzf_dingoa-JFyyCo81V2EYyEVN3m"
// // const appsecret = "YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg"
// // const REDIRECT_URI = "http://localhost:8083/"
//
// const appid = 'dingoa3ehg64tkdxwge7el'
// const appsecret = "r2Xz4FB8EDLZ-vwModMZh1UinKqGIaeknP5-94XVim6gs7GDXeBbxS6Fh0GdxKsN"
// const REDIRECT_URI = "http://localhost:8083/"
// /* GET user listing. */
// router.get('/ddLogin', async function (req, res, next) {
//     try {
//         const {code} = req.query
//         const getTokenRes = await getToken({appkey, appsecret})
//
//         const {accessToken, expiresIn} = getTokenRes.data
//         const getCodeRes = await getCode(appkey, REDIRECT_URI, tmp_auth_code)
//
//         const tempCode = getCodeRes.request.path.split('?')[1].split('&')[0].split('=')[1]
//         const getPersistentCodeRes = await getPersistentCode(access_token, tempCode)
//
//         const persistentCodetoken = getPersistentCodeRes.config.url.split('=')[1]
//         const {openid, persistent_code} = getPersistentCodeRes.data
//         const getSnsTokenRes = await getSnsToken(persistentCodetoken, openid, persistent_code)
//
//         const {sns_token} = getSnsTokenRes.data
//         const getUserInfoRes = await getUserInfo({sns_token})
//         // 请求很多次，有一次成功
//         getUserInfoRes.data.errcode === 0 && (function () {
//             console.log(getUserInfoRes.data)
//             response.responseSuccess(getUserInfoRes.data, res)
//         })()
//
//         // 数据库的操作
//         if(code) {
//             let dbRes = await User.find({name: '浙江省', password: '000000'})
//             let dbUser = dbRes.results[0]
//             if (dbUser) {
//                 let resInfo = {
//                     name: dbUser['name'],
//                     code: dbUser['code'],
//                     permission: dbUser['permission'],
//                     role: dbUser['role']
//                 }
//                 let token = Token.en(resInfo)
//                 response.status = true
//                 response.msg = 'success'
//                 response.data = {
//                     name: resInfo.name,
//                     role: resInfo.role,
//                     token,
//                     rights: Rights(resInfo.code)
//                 }
//             }
//             res.send(response)
//         } else {
//             response.responseFailed(res)
//         }
//     } catch (e) {
//         console.log(e.message)
//     }
//
//
//     // getToken({appkey, appsecret})
//     //     .then(response => {
//     //         const {access_token} = response.data
//     //         return getPersistentCode({
//     //             access_token,
//     //             tmp_auth_code
//     //         })
//     //     })
//     //     .then(response => {
//     //         // console.log(response)
//     //         const access_token = response.config.url.split('=')[1]
//     //         const {openid, persistent_code} = response.data
//     //         return getSnsToken({openid, persistent_code, access_token})
//     //     })
//     //     .then(response => {
//     //         const {sns_token} = response.data
//     //         console.log('sns_token:', sns_token)
//     //         return getUserInfo({sns_token})
//     //     })
//     //     .then(response => {
//     //         console.log('success', response.data)
//     //         // const { nick, unionid, dingId, openid } = response.data
//     //         res.send(response.data.user_info)
//     //     })
//     //     .catch(error => {
//     //         console.log(error)
//     //     })
//     // try {
//     //     // 数据库的操作
//     //     let dbRes = await User.find(user)
//     //     let dbUser = dbRes.results[0]
//     //     if (dbUser) {
//     //         let resInfo = {
//     //             name: dbUser['name'],
//     //             code: dbUser['code'],
//     //             permission: dbUser['permission'],
//     //             role: dbUser['role']
//     //         }
//     //         let token = Token.en(resInfo)
//     //         response.status = true
//     //         response.msg = 'success'
//     //         response.data = {
//     //             name: resInfo.name,
//     //             role: resInfo.role,
//     //             token,
//     //             rights: Rights(resInfo.code)
//     //         }
//     //     }
//     //     res.send(response)
//     //     // response.responseSuccess(response, res) // Converting circular structure to JSON
//     // } catch (e) {
//     //     console.log('/dd/ddLogin', e.message)
//     //     response.responseFailed(res)
//     // }
// });
//
// router.get('/loginOut', function (req, res, next) {
//     res.send('loginOut success');
// });
//
//
// module.exports = router;
