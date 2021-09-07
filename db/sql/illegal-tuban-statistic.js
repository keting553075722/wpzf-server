/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/14
 */
const SQL = require('./sql')
/**
 * 违法图斑查询SQL语句构建
 * @type {{cities(*=, *=): string, counties(*=, *=): string}}
 */
module.exports = {
    /**
     * 市级单位违法图斑个数/面积查询，全省各市/某市自身/多个市用like(取决于condition)
     * @param tableName
     * @param condition
     * @returns {string}
     */
    cities(tableName, condition) {
        if (!tableName) {
            throw new Error("表名无效，请输入正确的表名")
        }
        // 没有条件限制
        let sql = `Select 
                    XMC,
                    XDM,
                    SUM( IF(WFLX='违法批地',WFMJ,0)) '违法批地',
                    COUNT(WFLX='违法批地' or null )  '违法批地个数',
                    SUM( IF(WFLX='违法占地',WFMJ,0)) '违法占地',
                    COUNT(WFLX='违法占地' or null )  '违法占地个数',
                    SUM( IF(WFLX='违法转让',WFMJ,0)) '违法转让',
                    COUNT(WFLX='违法转让' or null )  '违法转让个数',
                    SUM( IF(WFLX='其他',WFMJ,0)) '其他',
                    COUNT(WFLX='其他' or null )  '其他违法个数',
                    SUM(WFMJ) 违法总面积,
                    COUNT(JZLX='违法' or null )  '违法总个数'
                    from ${tableName} `

        if (!(!condition || JSON.stringify(condition) === "{}")) {
            sql += SQL.where(condition)
        }
        return sql += ` group by CDM `
    },
    /**
     * 县级单位违法图斑个数查询，全省各县/某市县级/县级自己(取决于condition)
     * @param tableName
     * @param condition
     * @returns {string}
     */
    counties(tableName, condition) {
        if (!tableName) {
            throw new Error("表名无效，请输入正确的表名")
        }
        // 没有条件限制
        let sql = `Select 
                    XMC,
                    XDM,
                    SUM( IF(WFLX='违法批地',WFMJ,0)) '违法批地',
                    COUNT(WFLX='违法批地' or null )  '违法批地个数',
                    SUM( IF(WFLX='违法占地',WFMJ,0)) '违法占地',
                    COUNT(WFLX='违法占地' or null )  '违法占地个数',
                    SUM( IF(WFLX='违法转让',WFMJ,0)) '违法转让',
                    COUNT(WFLX='违法转让' or null )  '违法转让个数',
                    SUM( IF(WFLX='其他',WFMJ,0)) '其他',
                    COUNT(WFLX='其他' or null )  '其他违法个数',
                    SUM(WFMJ) 违法总面积,
                    COUNT(JZLX='违法' or null )  '违法总个数'
                    from ${tableName} `
        if (!condition || JSON.stringify(condition) === "{}") {
            return sql += ` group by XDM `
        }
        sql += SQL.where(condition)
        return sql += ` group by XDM `
    },

}
