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
 * 上级检测下级处于工作状态的状态对象
 *  处于工作状态的才能检测
 */
router.post('/get', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {tableName} = req.body
        let type = permission === role["province"] ? "1" : "2"
        let len = permission === role["province"] ? 2 : 4
        let result
        $statusObj[tableName] && $statusObj[tableName].length && (result = $statusObj[tableName].filter((itm) => itm["TYPE"] === type && itm["CODE"].substring(0, len) === code.substring(0, len)))
        result ? response.responseSuccess(result, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/get ', e.message)
        response.responseFailed(res)
    }
})

/**
 * 省级
 */
router.post('/process', async function (req, res, next) {
    try {
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
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/process ', e.message)
        response.responseFailed(res)
    }

});

/**
 * 只有省级有权限统计，统计自己，只有一条记录
 */
router.post('/statisticSelf', async function (req, res, next) {
    try {
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
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticSelf ', e.message)
        response.responseFailed(res)
    }


});

/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticChildren', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {code, permission, name} = user
        let {tableName} = req.body
        let condition = {
            "SDM": code
        }
        // type = 1
        let dbRes = await Status.statisticByBatch(tableName, role['city'], condition)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticChildren ', e.message)
        response.responseFailed(res)
    }

});


/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticGrandson', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        let {code, permission, name} = user
        let {tableName} = req.body

        let condition = {
            "SDM": code
        }

        let dbRes = await Status.statisticByBatch(tableName, 'county', condition)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticGrandson ', e.message)
        response.responseFailed(res)
    }
});

/**
 * 当前工作表
 */
router.post('/getCurrent', function (req, res, next) {
    // post请求参数存在body中
    try {
        $workTables ? response.responseSuccess($workTables.slice().reverse(), res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/getCurrent ', e.message)
        response.responseFailed(res)
    }
});

/**
 * 按年统计
 */
router.post('/statisticByYear', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)

        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }

        let {year} = req.body
        let dbRes = await Status.statisticByYear(year, '0')
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticByYear', e.message)
        response.responseFailed(res)
    }
});


router.post('/statisticChildrenByYear', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }
        let {year, condition} = req.body
        let dbRes = await Status.statisticByYear(year, '1', condition)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticChildrenByYear', e.message)
        response.responseFailed(res)
    }
});


router.post('/statisticGrandsonByYear', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }
        let {year, condition} = req.body
        let dbRes = await Status.statisticByYear(year, '2', condition)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticGrandsonByYear', e.message)
        response.responseFailed(res)
    }
});

router.post('/batchOfYear', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)

        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }

        let {year} = req.body
        let dbRes = await Status.batchOfYear(year)
        dbRes ? response.responseSuccess(dbRes, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/batchOfYear', e.message)
        response.responseFailed(res)
    }
});

router.post('/startTask', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)

        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }
        let {tableName} = req.body
        tableName && statusAdd(tableName)
        tableName ? response.responseSuccess('', res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/startTask', e.message)
        response.responseFailed(res)
    }

});

router.post('/endTask', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)

        if (user.permission !== role['province']) {
            response.responseFailed(res)
            return
        }
        let {tableName} = req.body
        tableName && statusDel(tableName)
        tableName ? response.responseSuccess('', res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/endTask', e.message)
        response.responseFailed(res)
    }
});


module.exports = router;
