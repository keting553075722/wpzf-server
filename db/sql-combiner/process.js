/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/14
 */
const SQL = require('./utils')
const {role} = require('../properties/permission-mapper')

/**
 * 审核举证进度条
 * @type {{getProcess(*=, *, *=): (string|*)}}
 */
module.exports = {
    /**
     * 进度
     * @param tableName
     * @param permission
     * @param condition
     * @returns {string|*}
     */
    getProcess(tableName, permission, condition = {}) {
        if (!tableName) {
            throw new Error("表名无效，请输入正确的表名")
        }

        let sql = ''
        let groupBy = ''

        let sqlSheng = `
        Select 
        SMC,
        SDM,
        COUNT( *) COUNT_SUM, 
        COUNT( SJXF = '1' or null) XF,
        COUNT( CJSB = '1' or null) SB,
        COUNT( SJSH = '1' or null) SH,
        COUNT( SJTG = '1' or null) TG,
        COUNT( SJTH = '1' or null) TH 
        `

        let sqlShi = `
        Select 
        CMC,
        CDM,
        COUNT( SJXF = '1' or null) SJXF,
        COUNT( CJXF = '1' or null) CJXF,
        COUNT( XJSB = '1' or null) SB,
        COUNT( CJSH = '1' or null) SH,
        COUNT( CJTG = '1' or null) TG,
        COUNT( CJTH = '1' or null) TH
        `

        let sqlXian = `
        Select 
        XMC,
        XDM,
        COUNT( CJXF = '1' or null) XF,
        COUNT( XJSB = '1' or null) SB,
        COUNT( XJJZ = '1' or null) JZ,
        COUNT( WYHC = '1' or null) WYHC,
        COUNT( HCSB = '1' or null) HCSB  
        `

        switch (permission) {
            case role["province"]:
                sql = sqlSheng
                groupBy = 'SDM'
                break
            case role["city"]:
                sql = sqlShi
                groupBy = 'CDM'
                break
            case role["county"]:
                sql = sqlXian
                groupBy = 'XDM'
                break
            default:
                throw new Error('getProcess Error')
                break
        }
        sql += ` from ${tableName} `
        // 判断condition不为空
        if (JSON.stringify(condition) !== "{}") {
            sql += SQL.where(condition)
        }
        return sql += ` group by ${groupBy}`
    },
}
