/**
 * @Description: 数据库连接池
 * @author zzh
 * @createTime 2021/4/1
 */

const mysql = require('mysql'); // mysql node driver
const { promisify } = require('util')
const mysqlPoolConfig = require('./secret/mysql.pool.config');   // mysql配置文件

const pool = mysql.createPool(mysqlPoolConfig)

module.exports = {
    query(sql, callback) {
        if (!sql) {
            callback()
            return
        }
        pool.query(sql, function (err, rows, fields) {
            if (err) {
                // console.log(err)
                callback(err, null)
                return
            }
            callback(null, rows, fields)
        })
    },
    queryfy(sql) {
        return promisify(pool.query(sql))
    },
    name: mysqlPoolConfig.database
}
