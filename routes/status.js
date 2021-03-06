/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/11
 */
const express = require('express');
const router = express.Router();
const Rights = require('../model/build-rights')
const {statusAdd, statusDel} = require('../model/status-observer')
const response = require('../model/response-format')
const {role} = require('../db/properties/permission-mapper')
const Token = require('../model/token')
const Status = require('../db/entities/status')
const Tuban = require('../db/entities/tuban')
const User = require('../db/entities/zzd-user')
const uniqueArr = require('../model/utils/removeTheSame')
const {aggregateObjs, objsByCityGroup, objsByCountyGroup} = require('../model/obj-aggregate')


/* GET user listing. */
/**
 * 上级检测下级处于工作状态的状态对象
 *  处于工作状态的才能检测
 */
router.get('/get', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {Id, tableName} = req.query
        let type = permission === role["province"] ? "1" : "2"
        let len = permission === role["province"] ? 2 : 4
        let result
        if($statusObj[Id][tableName] && $statusObj[Id][tableName].length == 0) {
            result = []
        } else {
            $statusObj[Id][tableName] && $statusObj[Id][tableName].length && (result = $statusObj[Id][tableName].filter((itm) => itm["TYPE"] === type && itm["CODE"].substring(0, len) === code.substring(0, len)))
        }
        result ? response.responseSuccess(result, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/get ', e.message)
        response.responseFailed(res, e.message)
    }
})

/**
 * 获取指定任务指定批次的状态
 */
router.get('/getself', function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission} = Token.de(token)
        let {Id, tableName} = req.query
        let type = permission === role["province"] ? "0" : permission === role["city"] ? '1' : '2'  // 0  1  2
        let len = permission === role["province"] ? 2 : permission === role["city"] ? '4' : '6'  // 2  4  6
        let result
        if($statusObj[Id][tableName] && $statusObj[Id][tableName].length == 0) {
            result = []
        } else {
            $statusObj[Id][tableName] && $statusObj[Id][tableName].length && (result = $statusObj[Id][tableName].filter((itm) => itm["CODE"] === code))
        }
        result.length ? response.responseSuccess(result[0], res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/getself ', e.message)
        response.responseFailed(res, e.message)
    }
})

router.get('/getMenu',async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let {name, code, permission, uid} = Token.de(token)
        // todo 需要进行校验
        let userRes = await User.findByUid(uid)
        let auth = userRes ? userRes.results[0].auth : ''
        let menuRes = await Rights(code, auth)
        menuRes ? response.responseSuccess(menuRes, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/get ', e.message)
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
    }
});

/**
 * 当前工作表 *****
 */
router.get('/getworktable', function (req, res, next) {
    // post请求参数存在body中
    try {
        let {Id} = req.query
        $workTables && $workTables[Id] ? response.responseSuccess($workTables[Id].slice().reverse(), res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/getworktable ', e.message)
        response.responseFailed(res, e.message)
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

        let {years, Id} = req.body

        let resObjs = {}
        for (const year of years) {
            let dbRes = await Status.statisticByYear(year, '0', Id).then(res => res).catch(console.log)
            dbRes && dbRes.results && (resObjs[year.toString()] = aggregateObjs(dbRes.results))
        }

        response.responseSuccess(resObjs, res)

        // let dbRes = await Status.statisticByYear(year, '0')
        // dbRes && dbRes.results ? response.responseSuccess(dbRes.results, res, 'success', [aggregateObjs]) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/statisticByYear', e.message)
        response.responseFailed(res, e.message)
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

        let {years, Id, condition} = req.body
        let resObjs = {}
        for (const year of years) {
            let dbRes = await Status.statisticByYear(year, '1', Id, condition).then(res => res).catch(console.log)
            dbRes && dbRes.results && (resObjs[year.toString()] = objsByCityGroup(dbRes.results))
        }
        response.responseSuccess(resObjs, res)
    } catch (e) {
        console.log('/status/statisticChildrenByYear', e.message)
        response.responseFailed(res, e.message)
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
        let {years, Id, condition} = req.body
        let resObjs = {}
        for (const year of years) {
            let dbRes = await Status.statisticByYear(year, '2', Id, condition).then(res => res).catch(console.log)
            dbRes && dbRes.results && (resObjs[year.toString()] = objsByCountyGroup(dbRes.results))
        }
        response.responseSuccess(resObjs, res)
    } catch (e) {
        console.log('/status/statisticGrandsonByYear', e.message)
        response.responseFailed(res, e.message)
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
        let {year, Id} = req.body
        let dbRes = await Status.batchOfYear(year, Id).then(res => res).catch(console.log)
        dbRes ? response.responseSuccess(dbRes, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/status/batchOfYear', e.message)
        response.responseFailed(res, e.message)
    }
});

router.get('/getTBYears', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        if (!token || user.permission !== role['province']) {
            response.responseFailed(res,response.msgType().common['1'])
            return
        }

        let {Id} = req.query
        let dbRes = await Tuban.queryTBTables(Id).then(res => res).catch(console.log)
        let years = dbRes.length ? dbRes.map(tableName => tableName.substr(0,2)==='zj'?tableName.substr(3,4):tableName.substr(5,4)) : []
        response.responseSuccess(years, res, 'success', [uniqueArr])
    } catch (e) {
        console.log('/status/getTBYears', e.message)
        response.responseFailed(res, e.message)
    }
});

router.post('/sjshTBYears', async function (req, res, next) {
    try {
        let token = req.headers.authorization
        let user = Token.de(token)
        if (!token || user.permission !== role['province']) {
            response.responseFailed(res,response.msgType().common['1'])
            return
        }
        let dbRes = await Tuban.sjshqueryTBTables().then(res => res).catch(console.log)
        let years = dbRes.length ? dbRes.map(tableName => tableName) : []
        response.responseSuccess(years, res, 'success', [uniqueArr])
    } catch (e) {
        console.log('/status/getTBYears', e.message)
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
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
        response.responseFailed(res, e.message)
    }
});


module.exports = router;
