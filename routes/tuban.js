var express = require('express');
var router = express.Router();
const Tuban = require('../db/entities/tuban')
const Token = require('../model/token')
const actions = require('../model/utils/actions')
const observer = require('../model/status-observer/index')
const {checkQuery, reportQuery, generalQuery} = require('../model/query-constructor')
const pagenate = require('../model/pagenation')
const response = require('../model/response-format')
const {role} = require('../db/properties/permission-mapper')

/* GET tuban listing. */
/**
 * 获取季度图斑,只能获取上一级已经下发的图斑
 */
router.post('/getJDTB', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {tableName, currentPage, pageSize} = req.body
        let condition = generalQuery(req.body, code)
        let dbRes = await Tuban.find(tableName, condition)

        dbRes && dbRes.results ? (function () {
            let data = actions.modifyTubanByPermission(dbRes.results, permission)
            let resData = pagenate(data, pageSize, currentPage)
            response.responseSuccess(resData, res)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/getJDTB', e.message)
        response.responseFailed(res, e.message)
    }
});


/**
 * 在上一级图斑已下发，并且本级已下发的图斑的条件下
 * 获取需要上报的图斑,省级无需上报,市级获取当前审核完成的图斑，县级获取已举证的图斑
 *
 */
router.post('/getReport', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {tableName, pageSize, currentPage} = req.body
        let condition = reportQuery(req.body, code)

        let dbRes = await Tuban.find(tableName, condition)

        dbRes && dbRes.results ? (function () {
            let data = actions.modifyTubanByPermission(dbRes.results, permission)
            let resData = pagenate(data, pageSize, currentPage)
            response.responseSuccess(resData, res)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/getReport', e.message)
        response.responseFailed(res, e.message)
    }
});


/**
 * 在上一级以及本级都已经下发的图斑条件下
 * 获取需要审核的图斑,省级获取市级已经上报的图斑,市级获取县级上报上来的图斑，县级无审核权限
 */
router.post('/getCheck', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {tableName, pageSize, currentPage} = req.body
        // 构造condition
        let condition = checkQuery(req.body, code)

        let dbRes = await Tuban.find(tableName, condition)

        dbRes && dbRes.results ? (function () {
            let data = actions.modifyTubanByPermission(dbRes.results, permission)
            let resData = pagenate(data, pageSize, currentPage)
            response.responseSuccess(resData, res)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/getCheck', e.message)
        response.responseFailed(res, e.message)
    }
});

/**
 * 获取数据库中存在的图斑的表,省级角色才能查询
 */
router.post('/queryTBTables', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {Id} = req.body
        let dbRes = await Tuban.queryTBTables(Id).then(res => res).catch(console.log)
        dbRes.length ? response.responseSuccess(dbRes.slice().reverse(), res) : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/queryTBTables', e.message)
        response.responseFailed(res, e.message)
    }
});

/**
 * 审核图斑，通过不通过
 */
router.post('/check', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {name, code, permission} = user
        let {SHYJ, SHTG, JCBHs, tableName} = req.body
        // 构建condition,check需要接收好多参数
        let {content, condition} = actions.check(user, SHYJ, SHTG, JCBHs)

        let dbRes = await Tuban.update(tableName, content, condition)

        dbRes && dbRes.results ? (function () {
            response.responseSuccess(dbRes.results.message, res)
            observer.check(tableName, code, permission)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/check', e.message)
        response.responseFailed(res, e.message)
    }
});

/**
 * 上报图斑 两条逻辑
 * 1.检查是否含有退回的
 * 2.有退回的,看退回的是否完成审核，完成 上报  否则   不上报
 * 2.没有退回的，看所有图斑是否完成审核
 * 如果存在退回图斑，对退回图斑的上报时，上级审核置为'',退回置为'', 上级通过置为'' 上报置为1
 */
router.post('/report', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {permission, code, name} = user
        let {tableName} = req.body

        // 先看有没有退回

        let condition = {}
        let THField = permission === 'city' ? 'SJTH' : 'CJTH'
        let SHFiled = permission === 'city' ? 'SJSH' : 'CJSH'
        let TGFiled = permission === 'city' ? 'SJTG' : 'CJTG'
        let XFField = permission === 'city' ? 'SJXF' : 'CJXF'
        let checkJZFiled = permission === 'city' ? 'CJSH' : 'XJJZ'
        if (permission === "province") {
            condition["XZQDM"] = code.substring(0, 2) + "%"
            // condition["XF"] = ""
        } else if (permission === "city") {
            condition["XZQDM"] = code.substring(0, 4) + "%"
            condition["SJXF"] = '1'
        } else {
            condition["XZQDM"] = code
            condition["CJXF"] = '1'
        }

        // 正常逻辑,不含退回的图斑
        let findRes = await Tuban.find(tableName, condition)

        findRes && findRes.results && await (async function () {
            let values = findRes.results
            if (!values.length) {
                response.responseFailed(res)
                return
            }

            let finishCheck = user.permission === role['city'] ? values.every(itm => itm['CJSH'] === '1') : values.every(itm => itm['XJJZ'] === '1')

            if (finishCheck) {
                let {content, condition} = actions.report(user)
                // 上报逻辑 两条线
                let selfStatus = global.$statusObj[tableName].find(x => x.CODE === code)
                if (selfStatus['TH'] === '1') {
                    condition[THField] = '1' //只上报退回图斑
                    content[THField] = ''
                    content[SHFiled] = ''
                    content[TGFiled] = ''
                }
                let updateRes = await Tuban.update(tableName, content, condition)
                /*updateRes && updateRes.results ? response.responseSuccess(updateRes.results.message, res) : response.responseFailed(res)*/
                updateRes && updateRes.results ? (function () {
                    response.responseSuccess(updateRes.results.message, res)
                    observer.report(tableName, code)
                })() : response.responseFailed(res)


            } else {
                response.responseFailed(res)
            }
        })()
    } catch (e) {
        console.log('/tuban/report', e.message)
        response.responseFailed(res, e.message)
    }


})


/**
 * 下发图斑，// 县级不会出发此按钮
 */
router.post('/giveNotice', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {code, permission} = user
        let {tableName, JZSJ, JCBHs} = req.body

        // 构建condition
        let {content, condition} = actions.dispatch(user, JCBHs, JZSJ)

        let dbRes = await Tuban.update(tableName, content, condition)

        dbRes && dbRes.results ? (function () {
            response.responseSuccess(dbRes.results.message, res)
            dbRes.results.matchRows && observer.giveNotice(tableName, permission, JCBHs)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/giveNotice', e.message)
        response.responseFailed(res, e.message)
    }
});

/**
 * 下发图斑，// 县级不会出发此按钮
 * 先找到上级下发的不通过的标记为退回
 * 将该单位[市县]标记为退回[需要手动标记吗]
 */
router.post('/reback', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {permission} = user
        let {tableName, name, code, type} = req.body

        // 构建condition
        let {content, condition} = actions.reback(user)

        let dbRes = await Tuban.update(tableName, content, condition)

        dbRes && dbRes.results ? (function () {
            response.responseSuccess(dbRes.results.message, res)
            dbRes.results.matchRows && observer.reback(tableName, code, type)
        })() : response.responseFailed(res)
    } catch (e) {
        console.log('/tuban/giveNotice', e.message)
        response.responseFailed(res, e.message)
    }

});

/**
 * 图斑判定，只有县级才回触发此按钮
 * 先没有做权限处理，客户端省市级隐藏举证的按钮
 */
router.post('/evidence', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {JZLX, WFLX, WFMJ, BZ, JCBHs, tableName} = req.body
        // 构建condition
        let {content, condition} = actions.evidence(user, JZLX, WFLX, WFMJ, BZ, JCBHs)

        let dbRes = await Tuban.update(tableName, content, condition)

        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)

    } catch (e) {
        console.log('/tuban/evidence', e.message)
        response.responseFailed(res, e.message)
    }
});

/**
 * 外业核查，只有县级才回触发此按钮
 */
router.post('/fieldVerification', async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)
    let {JCBHs, tableName} = req.body
    // 构建condition
    let {content, condition} = actions.fieldVerification(user, JCBHs)

    let dbRes = await Tuban.update(tableName, content, condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)

});
module.exports = router;
