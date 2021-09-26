/**
 * @Description:封装对tuban表的一些操作
 * @author zzh
 * @createTime 2021/4/1
 */
const SQL = require('./sql-combiner/basic-sql')
const processSQL = require('./sql-combiner/process')
const {statisticByBatchSQL} = require('./sql-combiner/statistic-by-batch')
const {proStatistic, cityStatistic, countyStatistic, tablesOfYear} = require('./sql-combiner/statistic-by-year')
const dbConfig = require('./db')
const db = require('./db')

module.exports = {
    /**
     * 指定表中查询记录
     * @param tableName
     * @param condition
     * @returns {Promise<unknown>}
     */
    find(tableName, condition) {
        return new Promise((resolve, reject) => {
            const sql = SQL.selectSQL(tableName, condition)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 指定表中插入记录
     * @param tableName
     * @param objs
     * @returns {Promise<unknown>}
     */
    insert(tableName, objs) {
        return new Promise((resolve, reject) => {
            let sql = SQL.insertSQL(tableName, objs)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 更新
     * @param tableName
     * @param content
     * @param condition
     * @returns {Promise<unknown>}
     */
    update(tableName, content, condition) {
        return new Promise((resolve, reject) => {
            let sql = SQL.updateSQL(tableName, content, condition)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 判断是否存在
     * @param tableName
     * @returns {Promise<unknown>}
     */
    exist(tableName) {
        return new Promise((resolve, reject) => {
            let sql = SQL.exisTableSQL(tableName)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 创建一张指定schema的表，默认是tuban
     * @param tableName
     * @returns {Promise<unknown>}
     */
    create(tableName) {
        return new Promise((resolve, reject) => {
            let sql = SQL.createTableSQL(tableName)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 清空指定的表
     * @param tableName
     * @returns {Promise<unknown>}
     */
    clearUp(tableName) {
        return new Promise((resolve, reject) => {
            let sql = `TRUNCATE TABLE ${tableName};`
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 删除指定的表
     * @param tableName
     * @returns {Promise<unknown>}
     */
    drop(tableName) {
        return new Promise((resolve, reject) => {
            let sql = `DROP TABLE ${tableName};`
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 查询所有的表
     * @returns {Promise<unknown>}
     */
    queryTBTables() {
        return new Promise((resolve, reject) => {
            let sql = `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${dbConfig.name}' and t.TABLE_NAME like 'zj%' `
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 省市县查询进度
     * @param tableName
     * @param permission
     * @param condition
     * @returns {Promise<unknown>}
     */
    queryProcess(tableName, permission, condition) {
        return new Promise((resolve, reject) => {
            let sql = processSQL.getProcess(tableName, permission, condition)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        })
    },

    /**
     * 按批次统计
     * @param tableName
     * @param condition
     * @param permission
     * @returns {Promise<unknown>}
     */
    statisticByBatch(tableName, condition, permission) {
        return new Promise(((resolve, reject) => {
            let sql = statisticByBatchSQL(tableName, condition, permission)
            db.query(sql).then(
                res => {
                    resolve(res)
                }
            ).catch(reject)
        }))
    },

    /**
     * 按年统计，0统计省级，1统计市级，2统计县级
     * @param year
     * @param type
     * @param condition
     * @returns {Promise<unknown>}
     */
    statisticByYear(year, type, condition = {}) {
        return new Promise( async (resolve, reject) => {
            let dbRes = await this.queryTBTables()
            if (type == '0') {
                let sqlRes =  proStatistic(year, condition, dbRes)
                sqlRes && db.query(sqlRes).then(
                    res => {
                        resolve(res)
                    }
                ).catch(reject)
            }

            if (type == '1') {
                let sqlRes =  cityStatistic(year, condition, dbRes)
                sqlRes && db.query(sqlRes).then(
                    res => {
                        resolve(res)
                    }
                ).catch(reject)
            }

            if (type == '2') {
                let sqlRes =  countyStatistic(year, condition, dbRes)
                sqlRes && db.query(sqlRes).then(
                    res => {
                        resolve(res)
                    }
                ).catch(reject)
            }


            //     type == '1' && cityStatistic(year, condition).then(
            //         sql => {
            //             sql && db.query(sql).then(
            //                 res => {
            //                     resolve(res)
            //                 }
            //             ).catch(reject)
            //         }
            //     ).catch(reject)
            //
            //     type == '2' && countyStatistic(year, condition).then(
            //         sql => {
            //             sql && db.query(sql).then(
            //                 res => {
            //                     resolve(res)
            //                 }
            //             ).catch(reject)
            //         }
            //     ).catch(reject)
        })
    },

    /**
     * 一个年度的批次的查询
     * @param year
     * @returns {Promise<*>}
     */
    batchOfYear(year) {
        return tablesOfYear(year)
    }
}
