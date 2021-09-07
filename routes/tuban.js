var express = require('express');
var router = express.Router();
const Tuban = require('../db/entities/tuban')
const Token = require('../model/token')
const actions = require('../model/utils/actions')
const observer = require('../model/status-observer/index')
const {checkQuery, reportQuery, generalQuery} = require('../model/query-constructor')
const response = {
    status: false,
    msg: 'failed',
    data: {}
};
response.clear = function () {
    this.status = false
    this.msg = 'failed'
    this.data = {}
}
/* GET tuban listing. */
/**
 * 获取季度图斑,只能获取上一级已经下发的图斑
 */
router.post('/getJDTB', function (req, res, next) {
    let token = req.headers.authorization
    let {name, code, permission} = Token.de(token).tokenKey
    let {tableName} = req.body
    let condition = generalQuery(req.body, code)
    Tuban.find(tableName, condition, function (tag, values) {
        response.status = tag
        if (tag) {
            response.msg = 'get TB success'
            response.data = actions.modifyTubanByPermission(permission, values)
        }
        res.json(response);
        response.clear()
    })
});

/**
 * 在上一级图斑已下发，并且本级已下发的图斑的条件下
 * 获取需要上报的图斑,省级无需上报,市级获取当前审核完成的图斑，县级获取已举证的图斑
 *
 */
router.post('/getReport', function (req, res, next) {
    let token = req.headers.authorization
    let {name, code, permission} = Token.de(token).tokenKey
    let {tableName} = req.body

    // 构造condition
    let condition = reportQuery(req.body, code)

    Tuban.find(tableName, condition, function (tag, values) {
        response.status = tag
        if (tag) {
            response.msg = 'getReport tuban success'
            response.data = actions.modifyTubanByPermission(permission, values)
        }
        res.json(response);
        // return
        response.clear()
    })
});

/**
 * 在上一级以及本级都已经下发的图斑条件下
 * 获取需要审核的图斑,省级获取市级已经上报的图斑,市级获取县级上报上来的图斑，县级无审核权限
 */
router.post('/getCheck', function (req, res, next) {
    let token = req.headers.authorization
    let {name, code, permission} = Token.de(token).tokenKey
    let {tableName} = req.body

    // 构造condition
    let condition = checkQuery(req.body, code)

    Tuban.find(tableName, condition, function (tag, values) {
        response.status = tag
        if (tag) {
            response.msg = 'getCheck tuban success'
            response.data = actions.modifyTubanByPermission(permission, values)
        }
        res.json(response);
        response.clear()
    })
});

/**
 * 获取数据库中存在的图斑的表,省级角色才能查询
 */
router.post('/queryTBTables', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    // let {JCBHs} = req.body

    const modifyTBName = (tableNames) => {
        let result = []
        tableNames.forEach(tableName => {
            result.push(tableName['table_name'])
        })
        return result
    }
    // 构建condition
    Tuban.queryTBTables(function (tag, result, field) {
        if (tag) {
            // 成功，修改状态，返回结果
            let data = modifyTBName(result).slice()
            response.status = true
            response.msg = "queryTBTables success"
            response.data = data.reverse()
        }
        res.json(response)
        response.clear()
    })
});

/**
 * 更新图斑,接收post请求
 */
router.post('/update', function (req, res, next) {
    res.send(response)
})

/**
 * 审核图斑，通过不通过
 */
router.post('/check', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {name, code, permission} = user
    let {SHYJ, SHTG, JCBHs, tableName} = req.body
    //
    // 构建condition,check需要接收好多参数
    let {content, condition} = actions.check(user, SHYJ, SHTG, JCBHs)
    updateTuban(tableName, content, condition, function (tag, result) {
        if (tag) {
            // 成功，修改状态，返回结果
            response.status = true
            response.msg = "check success"
            response.data = result
            observer.check(tableName, code, permission)
        }
        res.json(response)
        response.clear()
    })

});

/**
 * 上报图斑 两条逻辑
 * 1.检查是否含有退回的
 * 2.有退回的,看退回的是否完成审核，完成 上报  否则   不上报
 * 2.没有退回的，看所有图斑是否完成审核
 * 如果存在退回图斑，对退回图斑的上报时，上级审核置为'',退回置为'', 上级通过置为'' 上报置为1
 */
router.post('/report', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
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
    Tuban.find(tableName, condition, function (tag, values) {
        if (tag) {
            // 没有下发的图斑
            if (!values.length) {
                response.status = false
                response.msg = "report failed(没有下发图斑)"
                response.data = []
                res.json(response)
                response.clear()
                return
            }
            // 审核举证完成的条件
            let finishCheck = user.permission === 'city' ? values.every(itm => itm['CJSH'] === '1') : values.every(itm => itm['XJJZ'] === '1')
            // 如果完成审核举证
            if (finishCheck) {
                let {content, condition} = actions.report(user)
                // 上报逻辑 两条线
                let selfStatus = global.$statusObj[tableName].find(x=>x.CODE===code)
                if(selfStatus['TH']==='1'){
                    condition[THField]='1' //只上报退回图斑
                    content[THField] = ''
                    content[SHFiled] = ''
                    content[TGFiled] = ''
                }
                updateTuban(tableName, content, condition, function (tag, result) {
                    if (tag) {
                        // 成功，修改状态，返回结果
                        response.status = true
                        response.msg = "report success"
                        response.data = result
                        observer.report(tableName, code)
                    }
                    res.json(response)
                    response.clear()
                })
            } else {
                // 未完成举证
                response.msg = "report failed 未完成举证"
                res.json(response)
                response.clear()
            }
        }
    })
// 判断上一级下发的图斑本级是否审核完毕

})
;

/**
 * 下发图斑，// 县级不会出发此按钮
 */
router.post('/giveNotice', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {code, permission} = user
    let {tableName, JZSJ, JCBHs} = req.body

    // 构建condition
    let {content, condition} = actions.dispatch(user, JCBHs, JZSJ)
    updateTuban(tableName, content, condition, function (tag, result) {
        if (tag) {
            // 成功，修改状态，返回结果
            response.status = true
            response.msg = "giveNotice success"
            response.data = result
            if(result.matchRows){
                observer.giveNotice(tableName, permission,JCBHs)
            }

            // observer.check(tableName, code, permission)
        }
        res.json(response)
        response.clear()
    })
});

/**
 * 下发图斑，// 县级不会出发此按钮
 * 先找到上级下发的不通过的标记为退回
 * 将该单位[市县]标记为退回[需要手动标记吗]
 */
router.post('/reback', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {permission} = user
    let {tableName, name, code, type} = req.body

    // 构建condition
    let {content, condition} = actions.reback(user)
    updateTuban(tableName, content, condition, function (tag, result) {
        if (tag) {
            // 成功，修改状态，返回结果
            response.status = true
            response.msg = "reback success"
            response.data = result
            observer.reback(tableName, code, type)
        }
        res.json(response)
        response.clear()
    })
});

/**
 * 图斑判定，只有县级才回触发此按钮
 * 先没有做权限处理，客户端省市级隐藏举证的按钮
 */
router.post('/evidence', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {JZLX, WFLX, WFMJ, BZ, JCBHs, tableName} = req.body
    // 构建condition
    let {content, condition} = actions.evidence(user, JZLX, WFLX, WFMJ, BZ, JCBHs)
    updateTuban(tableName, content, condition, function (tag, result) {
        if (tag) {
            // 成功，修改状态，返回结果
            response.status = true
            response.msg = "evidence success"
            response.data = result
        }
        res.json(response)
        response.clear()
    })

});

/**
 * 外业核查，只有县级才回触发此按钮
 */
router.post('/fieldVerification', function (req, res, next) {
    let token = req.headers.authorization
    let user = Token.de(token).tokenKey
    let {JCBHs, tableName} = req.body
    // 构建condition
    let {content, condition} = actions.fieldVerification(user, JCBHs)
    updateTuban(tableName, content, condition, function (tag, result) {
        if (tag) {
            // 成功，修改状态，返回结果
            response.status = true
            response.msg = "fieldVerification success"
            response.data = result
        }
        res.json(response)
        response.clear()
    })
});

const updateTuban = (tableName, content, condition, callback) => {
    Tuban.update(tableName, content, condition, function (tag, result) {
        if (tag) {
            callback(true, result)
        } else {
            callback(false, result)
        }
    })
}

module.exports = router;
