/**
 * @Description:
 * @author zzh
 * @createTime 2021/6/10
 */
const SQL = require('./utils')
const modifyTBName = (tableNames) => {
    let result = []
    tableNames.forEach(tableName => {
        result.push(tableName['table_name'])
    })
    return result
}

const proStatistic = (year, condition, dbRes) => {
    // let dbRes = await Tuban.queryTBTables()
    let tables = modifyTBName(dbRes.results).slice()

    const statisticTables = tables.filter(x => x.indexOf(year) > -1)
    let len = statisticTables.length
    if (!len) {
        return false
    }
    let whereStatement = ''
    if (!(!condition || JSON.stringify(condition) === "{}")) {
        whereStatement = SQL.where(condition)
    }
    let sql = `
        Select 
        SMC,
        SDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[0]} 
         ${whereStatement}
        group by SDM
        `

    for (let i = 1; i < len; i++) {
        sql += `
        UNION ALL
        Select 
        SMC,
        SDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[i]} 
        ${whereStatement}
        group by SDM
        `
    }
    return sql
}

const cityStatistic = (year, condition, dbRes) => {
    // let  = await Tuban.queryTBTables()
    let tables = modifyTBName(dbRes.results).slice()
    const statisticTables = tables.filter(x => x.indexOf(year) > -1)
    let len = statisticTables.length
    if (!len) {
        return false
    }
    let whereStatement = ''
    if (!(!condition || JSON.stringify(condition) === "{}")) {
        whereStatement = SQL.where(condition)
    }
    let sql = `
        Select 
        CMC,
        CDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[0]} 
        ${whereStatement}
        group by CDM
        `


    for (let i = 1; i < len; i++) {
        sql += `
        UNION ALL
        Select 
        CMC,
        CDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[i]} 
        ${whereStatement}
        group by CDM
        `
    }
    return sql
}

const countyStatistic = (year, condition, dbRes) => {
    // let dbRes = await Tuban.queryTBTables()
    let tables = modifyTBName(dbRes.results).slice()
    const statisticTables = tables.filter(x => x.indexOf(year) > -1)
    let len = statisticTables.length
    if (!len) {
        return false
    }
    let whereStatement = ''
    if (!(!condition || JSON.stringify(condition) === "{}")) {
        whereStatement = SQL.where(condition)
    }
    let sql = `
        Select 
        XMC,
        XDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[0]} 
        ${whereStatement}
        group by XDM
        `


    for (let i = 1; i < len; i++) {
        sql += `
        UNION ALL
        Select 
        XMC,
        XDM,
        COUNT( *) COUNT_TB, -- 季度图斑总数
        SUM(Shape_Area) SUM_Area, -- 季度图斑总面积
        SUM(mj) SUM_MJ, -- 季度图斑总面积（平方米）
        COUNT( SJXF = '1' or null) COUNT_XF, 
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
        from ${statisticTables[i]} 
        ${whereStatement}
        group by XDM
        `
    }
    return sql
}
//
// const tablesOfYear = async (year) => {
//   let tables = await queryTables()
//   return tables.filter(x => x.indexOf(year) > -1)
// }


module.exports = {proStatistic, cityStatistic, countyStatistic}


