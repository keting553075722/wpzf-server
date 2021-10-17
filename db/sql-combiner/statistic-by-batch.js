/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/14
 */
const SQL = require('./utils')
const {role} = require('../properties/permission-mapper')

const province_sum = (tableName, condition) => {
    if (!tableName) {
        throw new Error("表名无效，请输入正确的表名")
    }
    // 没有条件限制
    let sql = `
        Select 
        SMC,
        SDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(AREA) SUM_Area, -- 季度图斑总面积
        SUM(AREA) SUM_MJ, -- 季度图斑总面积(平方米)
        COUNT( SJXF = '1' or null) COUNT_XF, 
        COUNT( CJSB = '1' or null) COUNT_SB,
        COUNT( JZLX = '合法' or null) COUNT_HF, 
        COUNT( JZLX = '违法' or null) COUNT_WF,
        COUNT( SJSH = '1' or null) COUNT_SH,
        COUNT( SJSH = '0' or null) COUNT_WSH,
        COUNT( SJTH = '1' or null) COUNT_TH,
        SUM(WFMJ)SUM_WF, 
        COUNT( WFLX = '违法转让' or null) COUNT_WFZR,
        SUM( IF(WFLX='违法转让',WFMJ,0)) SUM_WFZR, 
        COUNT( WFLX = '违法占地' or null) COUNT_WFZD, 
        SUM( IF(WFLX='违法占地',WFMJ,0)) SUM_WFZD, 
        COUNT( WFLX = '违法批地' or null) COUNT_WFPD,
        SUM( IF(WFLX='违法批地',WFMJ,0)) SUM_WFPD,    
        COUNT( WFLX = '其他' or null) COUNT_WFQT, 
        SUM( IF(WFLX='其他',WFMJ,0)) SUM_WFQT 
        from ${tableName} `

    if (!(!condition || JSON.stringify(condition) === "{}")) {
        sql += SQL.where(condition)
    }
    return sql += ` group by SDM `
}

/**
 * 市级单位执法图斑个数/面积查询，全省各市/某市自身/多个市用like(取决于condition)
 * @param tableName
 * @param condition
 * @returns {string|*}
 */
const cities = (tableName, condition) => {
    if (!tableName) {
        throw new Error("表名无效，请输入正确的表名")
    }
    // 没有条件限制
    let sql = `
        Select 
        CMC,
        CDM,
        COUNT( *) COUNT_TB,
        SUM(AREA) SUM_Area, -- 季度图斑总面积
        SUM(AREA) SUM_MJ, -- 季度图斑总面积(平方米)
        COUNT( JZLX = '合法' or null) COUNT_HF, 
        COUNT( JZLX = '违法' or null) COUNT_WF, 
        COUNT( CJXF = '1' or null) COUNT_XF,
        COUNT( CJSB = '1' or null) COUNT_SB,
        COUNT( CJSH = '1' or null) COUNT_SH,
        COUNT( CJSH = '0' or null) COUNT_WSH,
        COUNT( CJTH = '1' or null) COUNT_TH,
        SUM(WFMJ) SUM_WF,
        COUNT( WFLX = '违法转让' or null) COUNT_WFZR,
        SUM( IF(WFLX='违法转让',WFMJ,0)) SUM_WFZR,
        COUNT( WFLX = '违法占地' or null) COUNT_WFZD, 
        SUM( IF(WFLX='违法占地',WFMJ,0)) SUM_WFZD,
        COUNT( WFLX = '违法批地' or null) COUNT_WFPD, 
        SUM( IF(WFLX='违法批地',WFMJ,0)) SUM_WFPD, 
        COUNT( WFLX = '其他' or null) COUNT_WFQT, 
        SUM( IF(WFLX='其他',WFMJ,0)) SUM_WFQT
        from ${tableName} `
    if (!(!condition || JSON.stringify(condition) === "{}")) {
        sql += SQL.where(condition)
    }
    return sql += ` group by CDM `
}

/**
 * 县级单位执法图斑个数查询，全省各县/某市县级/县级自己(取决于condition)
 * @param tableName
 * @param condition
 * @returns {string|*}
 */
const counties = (tableName, condition = {}) => {
    if (!tableName) {
        throw new Error("表名无效，请输入正确的表名")
    }
    // 没有条件限制
    let sql = `
        Select 
        XMC,
        XDM,
        COUNT( JZLX = '合法' or null) COUNT_HF, 
        COUNT( JZLX = '违法' or null) COUNT_WF, 
        SUM(WFMJ) SUM_WF,
        COUNT( WFLX = '违法转让' or null) COUNT_WFZR, 
        SUM( IF(WFLX='违法转让',WFMJ,0)) SUM_WFZR,
        COUNT( WFLX = '违法占地' or null) COUNT_WFZD, 
        SUM( IF(WFLX='违法占地',WFMJ,0)) SUM_WFZD,
        COUNT( WFLX = '违法批地' or null) COUNT_WFPD, 
        SUM( IF(WFLX='违法批地',WFMJ,0)) SUM_WFPD, 
        COUNT( WFLX = '其他' or null) COUNT_WFQT, 
        SUM( IF(WFLX='其他',WFMJ,0)) SUM_WFQT 
        from ${tableName} `
    if (!condition || JSON.stringify(condition) === "{}") {
        return sql += ` group by XDM `
    }
    sql += SQL.where(condition)
    return sql += ` group by XDM `
}

const statisticByBatchSQL = (tableName, condition,permission) => {
    let sql
    switch (permission) {
        case role['province']:
            sql = province_sum(tableName, condition)
            break
        case role['city']:
            sql = cities(tableName, condition)
            break
        case role['county']:
            sql = counties(tableName, condition)
            break
        default:
            throw new Error('entities/status.js  acquireStatistic Error ')
    }
    return sql
}
module.exports = {
    statisticByBatchSQL
}

