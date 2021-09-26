const db = require('../../table-operator')

module.exports = {
    /**
     * 输入权限获取当前级别下所有进度
     * @param tableName
     * @param permission
     * @param condition
     * @returns {Promise<unknown>}
     */
    acquireProcess(tableName, permission, condition) {
        return db.queryProcess(tableName, permission, condition)
    },

    /**
     * 按批次统计
     * @param tableName
     * @param permission
     * @param condition
     * @returns {Promise<unknown>}
     */
    statisticByBatch(tableName, permission, condition) {
        return db.statisticByBatch(tableName, condition, permission)
    },

    /**
     * 按年统计，0统计省级，1统计市级，2统计县级
     * @param year
     * @param type
     * @param condition
     * @returns {Promise<unknown>|void}
     */
    statisticByYear(year, type, condition) {
        return db.statisticByYear(year, type, condition)
    },

    /**
     * 返回数据库中指定年份的批次
     * @param year
     * @returns {Promise<*>}
     */
    batchOfYear(year) {
        return db.batchOfYear(year)
    }
}
