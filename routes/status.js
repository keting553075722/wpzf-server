/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/11
 */
const express = require('express');
const router = express.Router();
const {statusAdd, statusDel} = require('../model/status-observer')
const response = require('../model/response-format')
const {role} = require('../db/properties/permission-mapper')
const Token = require('../model/token')
const Status = require('../db/entities/status')


/* GET user listing. */
/**
 * 上级检测下级的状态对象
 *  处于工作状态的才能检测
 */
router.post('/get', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {tableName} = req.body
        let type = permission === role["province"] ? "1" : "2"
        let len = permission === role["province"] ? 2 : 4
        let result = $statusObj[tableName].filter((itm) => itm["TYPE"] === type && itm["CODE"].substring(0, len) === code.substring(0, len))
        result && response.responseSuccess(result, res)
    } catch (e) {
        console.log('/statisticByYear ', e.message)
        response.responseFailed('2', res)
    }

})

/**
 * 省级
 */
router.post('/process', async function (req, res, next) {
    // 当前工作表进度
    let {tableName} = req.body
    let token = req.headers.authorization
    let user = Token.de(token)
    let {code, permission, name} = user
    // 只需要权限和code两个参数  permission code
    let field = {
        "province": "SDM",
        "city": "CDM",
        "county": "XDM",
    }
    let condition = {}
    condition[field[permission]] = code
    let dbRes = await Status.acquireProcess(tableName, permission, condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});

/**
 * 只有省级有权限统计，统计自己，只有一条记录
 */
router.post('/statisticSelf', async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)
    let {code, permission, name} = user
    let {tableName} = req.body

    let field = {
        "province": "SDM",
        "city": "CDM",
        "county": "XDM",
    }
    let condition = {}
    condition[field[permission]] = code

    let dbRes = await Status.statisticByBatch(tableName, permission, condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)

});

/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticChildren', async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)
    let {code, permission, name} = user
    let {tableName} = req.body
    let condition = {
        "SDM": code
    }
    // type = 1
    let dbRes = await Status.statisticByBatch(tableName, role['city'], condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});


/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticGrandson', async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)
    let {code, permission, name} = user
    let {tableName} = req.body

    let condition = {
        "SDM": code
    }

    let dbRes = await Status.statisticByBatch(tableName, 'county', condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});

/**
 * 当前工作表
 */
router.post('/getCurrent', function (req, res, next) {
    // post请求参数存在body中
    $workTables && response.responseSuccess($workTables.slice().reverse(), res)
});

/**
 * 按年统计
 */
router.post('/statisticByYear', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)

        if (user.permission !== role['province']) {
            response.responseFailed('1')
            res.send(response)
            response.clear()
            return
        }

        let {year} = req.body
        let dbRes = await Status.statisticByYear(year, '0')
        dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
    } catch (e) {
        let reqq = req
        console.log(e.message)
        response.responseFailed('2', res)
    }
});


router.post('/statisticChildrenByYear',async  function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)

    if (user.permission !== role['province']) {
        response.responseFailed('1')
        return
    }

    let {year, condition} = req.body

    let dbRes = await Status.statisticByYear(year, '1', condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});


router.post('/statisticGrandsonByYear',async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)

    if (user.permission !== role['province']) {
        response.responseFailed('1')
        return
    }
    let {year, condition} = req.body

    let dbRes = await Status.statisticByYear(year, '2', condition)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});

router.post('/batchOfYear',async function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)

    if (user.permission !== role['province']) {
        response.responseFailed('1')
        return
    }

    let {year} = req.body
    let dbRes = await Status.batchOfYear(year)
    dbRes && dbRes.results && response.responseSuccess(dbRes.results, res)
});

router.post('/startTask', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)

    if (user.permission !== role['province']) {
        response.responseFailed('1')
        return
    }
    let {tableName} = req.body
    tableName && statusAdd(tableName)
    response.responseSuccess('', res)
});

router.post('/endTask', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token)

    if (user.permission !== role['province']) {
        response.responseFailed('1')
        return
    }

    let {tableName} = req.body
    tableName && statusDel(tableName)
    response.responseSuccess('', res)
});


module.exports = router;
