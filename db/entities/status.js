/**
 * @Description:状态对象及其一些操作
 * @author zzh
 * @createTime 2021/4/11
 */

const statusInitializeProps = require('../properties/status-initialize')
const db = require('../operators')
const DB = require('../db')
const process = require('../sql/process')
const statistic = require('../sql/statistic-by-batch')
const {proStatistic, cityStatistic, countyStatistic, tablesOfYear} = require('../sql/statistic-by-year')


module.exports = {
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
        }, 'status')
    },

    insertAndInitialize(tableName, objs, callback, mode) {
        db.insert(tableName, objs, 'status', function (tag, insertRes) {
            if (tag) {
                db.update(tableName, statusInitializeProps, {}, function (tag, updateRes) {
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
    update(content, condition, callback) {
        db.update("status", content, condition, function (tag, res) {
            callback(tag, res)
        })
    },
    clearStatus(callback) {
        db.update("status", statusInitializeProps, {}, function (tag, res) {
            callback(tag, res)
        })
    },
    findChildren(permission, code, condition, callback) {
        // let condition ={}
        if (permission === "province") {
            condition["CITYCODE"] = code.substring(0, 2) + "%"
        } else if (permission) {
            condition["COUNTYCODE"] = code.substring(0, 4) + "%"
        }

        db.select('status', condition, function (tag, val) {
            if (tag) {
                callback(true, val)
            } else {
                callback(false)
            }
        })
    },
    acquireProcess(tableName, permission, condition, callback) {
        let sql = process.getProcess(tableName, permission, condition)
        DB.query(sql, function (err, result, fields) {
            if (!err) {
                callback(true, result, fields)
            } else {
                callback(false, result, fields)
            }
        })
    },

    acquireStatistic(tableName, permission, condition, callback) {
        let sql = ''
        switch (permission) {
            case 'province':
                sql = statistic.province_sum(tableName, condition)
                break
            case 'city':
                sql = statistic.cities(tableName, condition)
                break
            case 'county':
                sql = statistic.counties(tableName, condition)
                break
            default:
                throw new Error('entities/status.js  acquireStatistic Error ')
        }

        DB.query(sql, function (err, result, fields) {
            if (!err) {
                callback(true, result, fields)
            } else {
                callback(false, result, fields)
            }
        })
    },
    statisticByY(year, callback) {
        proStatistic(year).then(sql => {
            if (sql) {
                DB.query(sql, function (err, result) {
                    if (!err) {
                        let keys = Object.keys(result[0])
                        let acc = result.reduce((acc, cur, idx) => {
                            for (let i = 0; i < keys.length; i++) {
                                if (i < 2)
                                    acc[keys[i]] = cur[keys[i]]
                                else {
                                    if (!acc[keys[i]]) acc[keys[i]] = Number(cur[keys[i]])
                                    else acc[keys[i]] += Number(cur[keys[i]])
                                }
                            }
                            return acc
                        }, {})
                        callback(true, acc)
                    } else {
                        callback(false, result)
                    }
                })
            } else {
                callback(false, result)
            }
        }).catch((err) => {
            callback(false, err)
        })
    },
    statisticChildrenByY(year, condition, callback) {
        cityStatistic(year, condition).then(sql => {
            if (sql) {
                DB.query(sql, function (err, result) {
                    if (!err) {
                        let keys = Object.keys(result[0])
                        let acc = []
                        let map = {}
                        let i = 0  // 记录当前item在acc中的位置
                        result.forEach((item, index, arr) => {
                            if (map[item['CDM']]===undefined) {
                                map[item['CDM']] = i
                                acc[i] = item
                                i++
                            } else {
                                let accIndex = map[item['CDM']]
                                for (let j = 2; j < keys.length; j++) {
                                    acc[accIndex][keys[j]] += item[keys[j]]
                                }
                            }
                        })
                        callback(true, acc)
                    } else {
                        callback(false, result)
                    }
                })
            } else {
                callback(false, result)
            }
        }).catch((err) => {
            callback(false, err)
        })
    },
    statisticGrandsonByY(year, condition, callback) {
        countyStatistic(year, condition).then(sql => {
            if (sql) {
                DB.query(sql, function (err, result) {
                    if (!err) {
                        let keys = Object.keys(result[0])
                        let acc = []
                        let map = {}
                        let i = 0  // 记录当前item在acc中的位置
                        result.forEach((item, index, arr) => {
                            if (map[item['XDM']]===undefined) {
                                map[item['XDM']] = i
                                acc[i] = item
                                i++
                            } else {
                                let accIndex = map[item['XDM']]
                                for (let j = 2; j < keys.length; j++) {
                                    acc[accIndex][keys[j]] += item[keys[j]]
                                }
                            }
                        })
                        callback(true, acc)
                    } else {
                        callback(false, result)
                    }
                })
            } else {
                callback(false, result)
            }
        }).catch((err) => {
            callback(false, err)
        })
    },
    batchOfY(year, callback) {
        tablesOfYear(year).then(
            tables => {
                if (tables.length) {
                    callback(true, tables)
                    return
                } else {
                    callback(false, tables)
                    return
                }
            }
        )
    }
}
