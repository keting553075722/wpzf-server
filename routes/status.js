/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/11
 */
var express = require('express');
var router = express.Router();
const {statusAdd, statusDel} = require('../model/status-observer')
const response = {
    status: false,
    msg: 'failed',
    data: {}
}
response.clear = function () {
    this.status = false
    this.msg = 'failed'
    this.data = {}
}
const Status = require('../db/entities/status')
const Token = require('../model/token')


/* GET user listing. */
/**
 * 上级检测下级的状态对象
 *  处于工作状态的才能检测
 */
router.post('/get', function (req, res, next) {
    // post请求参数存在body中
    let token = req.headers.authorization
    let {name, code, permission} = Token.de(token).tokenKey
    let {tableName} = req.body
    let type = permission === "province" ? "1" : "2"
    let len = permission === "province" ? 2 : 4
    let result = $statusObj[tableName].filter((itm) => itm["TYPE"] === type && itm["CODE"].substring(0, len) === code.substring(0, len))
    response.status = true
    response.msg = 'success'
    response.data = result
    res.send(response);
    response.clear()
})

/**
 * 上报更新，更新一条字段,更新自己,审核更新呢
 * 根据code和内容更新
 */
router.post('/update', function (req, res, next) {
    // post请求参数存在body中
    let content = JSON.parse(req.body.content)
    let condition = JSON.parse(req.body.condition)
    let response = {
        status: false,
        msg: "update failed",
        data: {}
    }
    Status.update(content, condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "update success"
            response.data = result
        }
        res.send(response)
    })
});

router.post('/process', function (req, res, next) {
    // 当前工作表进度
    let {tableName} = req.body
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {code, permission, name} = user
    // 只需要权限和code两个参数  permission code

    let field = {
        "province": "SDM",
        "city": "CDM",
        "county": "XDM",
    }
    let condition = {}
    condition[field[permission]] = code

    Status.acquireProcess(tableName, permission, condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "acquire process success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});
/**
 * 只有省级有权限统计，统计自己，只有一条记录
 */
router.post('/statisticSelf', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {code, permission, name} = user
    let {tableName} = req.body

    let field = {
        "province": "SDM",
        "city": "CDM",
        "county": "XDM",
    }
    let condition = {}
    condition[field[permission]] = code
    // let condition = {
    //     "SDM" : code
    // }

    Status.acquireStatistic(tableName, permission, condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticSelf success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});
/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticChildren', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {code, permission, name} = user
    let {tableName} = req.body
    let condition = {
        "SDM": code
    }

    Status.acquireStatistic(tableName, 'city', condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticChildren success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});
/**
 * 只有省级有权限统计，统计孩子，只有11条记录
 */
router.post('/statisticGrandson', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {code, permission, name} = user
    let {tableName} = req.body

    let condition = {
        "SDM": code
    }

    Status.acquireStatistic(tableName, 'county', condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticGrandson success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});
/**
 * 当前工作表
 */
router.post('/getCurrent', function (req, res, next) {
    // post请求参数存在body中
    if ($workTables) {
        let data = $workTables.slice()
        response.status = true
        response.msg = "getCurrent success"
        response.data = data.reverse()
    }
    res.send(response)
    response.clear()
});

router.post('/statisticByYear', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {year} = req.body
    Status.statisticByY(year, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticByYear success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});

router.post('/statisticChildrenByYear', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {year, condition} = req.body
    !condition && (condition = {})
    Status.statisticChildrenByY(year, condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticChildrenByYear success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});


router.post('/statisticGrandsonByYear', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {year, condition} = req.body
    !condition && (condition = {})
    Status.statisticGrandsonByY(year, condition, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "statisticGrandsonByYear success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});

router.post('/batchOfYear', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {year} = req.body
    Status.batchOfY(year, function (tag, result) {
        if (tag) {
            response.status = true
            response.msg = "batchOfYear success"
            response.data = result
        }
        res.send(response)
        response.clear()
    })
});

router.post('/startTask', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {tableName} = req.body
    tableName && statusAdd(tableName)
    response.status = true
    response.msg = "startTask success"
    response.data = []
    res.send(response)
    response.clear()
});

router.post('/endTask', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    if (user.permission !== 'province') {
        response.status = false
        response.msg = "没有权限"
        res.send(response)
        response.clear()
        return
    }
    let {tableName} = req.body
    tableName && statusDel(tableName)
    response.status = true
    response.msg = "endTask success"
    response.data = []
    res.send(response)
    response.clear()
});



module.exports = router;
