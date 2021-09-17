/**
 * @Description: 数据库连接池
 * @author zzh
 * @createTime 2021/4/1
 */

const mysql = require('mysql'); // mysql node driver
const { promisify } = require('util')
const mysqlPoolConfig = require('./secret/mysql.pool.config-localhost');   // mysql配置文件

const pool = mysql.createPool(mysqlPoolConfig)

module.exports = {
    query(sql, callback) {
        if (!sql) {
            callback()
            return
        }
        pool.query(sql, function (err, rows, fields) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, rows, fields)
            }

        })
    },
    queryfy: promisify(pool.query),
    name: mysqlPoolConfig.database
}
