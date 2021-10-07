/**
 * @Description: 数据库连接
 * @author zzh
 * @createTime 2021/4/1
 */

const mysql = require('mysql'); // mysql node driver
/*const mysqlConfig = require('./secret/mysql.pool.config-localhost');   // mysql配置文件*/
const mysqlConfig = require('./secret/mysql.pool.config');   // mysql配置文件
// const connection = mysql.createConnection(mysqlConfig)
const pool = mysql.createPool(mysqlConfig)
module.exports = {
    query(sql, params) {
        return new Promise((resolve, reject) => {
            if (!sql) return reject('must input a sql expression')

            pool.getConnection((err, connection) => {
                connection.query(sql, params, (err, results, fields) => {//执行sql语句
                    connection.release();
                    if (err) return reject(err)
                    resolve({results, fields})
                })
            })
        })
    },
    name: mysqlConfig.database
}
