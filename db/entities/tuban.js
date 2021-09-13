/**
 * @Description:封装对tuban表的一些操作
 * @author zzh
 * @createTime 2021/4/1
 */
const db = require('../operators')
const dbConfig = require('../db')
const tubanInitializeProps = require('../properties/tuban-initialize')
const DB = require('../db')

module.exports = {
    /**
     * 返回的是一个数组对象
     * @param tableName
     * @param condition
     * @param callback
     */
    find(tableName, condition, callback) {
        db.select(tableName, condition, function (tag, val) {
            callback(tag, val)
        })
    },
    /**
     * 返回tag和插入的行数
     * @param tableName
     * @param objs
     * @param type
     * @param callback
     */
    insert(tableName, objs, callback, mode) {
        db.insert(tableName, objs, 'tuban', function (tag, affectedRows) {
            callback(tag, affectedRows)
        }, mode)
    },

    insertAndInitialize(tableName, objs, callback, mode) {
        db.insert(tableName, objs, 'tuban', function (tag, insertRes) {
            if (tag) {
                db.update(tableName, tubanInitializeProps, {}, function (tag, updateRes) {
                    if (tag) {
                        callback(true, {insertRes, updateRes})
                    } else {
                        callback(false, {insertRes, updateRes})
                    }
                })
            } else {
                callback(false, insertRes)
            }
        }, mode)
    },
    /**
     * 组合条件更新，条件只能是普通对象
     * @param tableName
     * @param content
     * @param condition
     * @param callback
     */
    update(tableName, content, condition, callback) {
        db.update(tableName, content, condition, function (tag, res) {
            callback(tag, res)
        })
    },
    batchUpdate() {
    },
    exist(tableName, callback){
        db.exist(tableName, function (tag) {
                if (tag) {
                    // table存在
                    callback(true)
                } else {
                    // table不存在
                    callback(false)
                }
            }
        )
    },
    create(tableName, callback) {
        db.created(tableName, function (tag, res, field) {
            if (tag) {
                // 创建成功
                callback(true)
                return
            } else {
                callback(false)
                return
            }
        })
    },
    copy(oldTable, newTable, callback) {
        let sql = `insert into ${newTable} select * from ${oldTable}`
        DB.query(sql, function (err, res, field) {
            if (!err) {
                callback(true, res, field)
            } else {
                callback(false, res, field)
            }
        })
    },
    clear(tableName, callback){
        let sql = `TRUNCATE TABLE ${tableName};`
        DB.query(sql, function (err, res, field) {
            if (!err) {
                callback(true, res, field)
            } else {
                callback(false, res, field)
            }
        })
    },
    drop(tableName, callback){
        let sql = `DROP TABLE ${tableName};`
        DB.query(sql, function (err, res, field) {
            if (!err) {
                callback(true, res, field)
            } else {
                callback(false, res, field)
            }
        })
    },
    queryTBTables(callback){
        let sql = `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${dbConfig.name}' and t.TABLE_NAME like 'zj%' `
        DB.query(sql, function (err, res, field) {
            if (!err) {
                callback(true, res, field)
            } else {
                callback(false, res, field)
            }
        })
    },
    getCoordinate(ids, tableName, callback){
        let sql = `select coordinates from ${tableName}  where JCBH =  ${ids}`
        DB.query(sql, function (err, res, field) {
            if (!err) {
                callback(true, res, field)
            } else {
                callback(false, res, field)
            }
        })
    },

}
