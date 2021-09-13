/**
 * @Description:
 * @author zzh
 * @createTime 2021/3/31
 */
const db = require('./db')
const SQL = require('./sql/sql')
const tuban = require('./properties/tuban_definition')
const user = require('./properties/user_definition')
const status = require('./properties/status_definition')
const displayFields = Object.keys(tuban).filter(x=>x!=='coordinates')

/**
 * 根据entry实体创建表
 * @param tableName
 * @param entry
 * @returns {string}
 */
const createSQL = function (tableName, entry) {
    // 根据tableName，entry实体创建表
    // 组装sql
    let fields = Object.keys(entry)
    let sql = `CREATE TABLE ${tableName} (`
    fields.forEach(field => {
        sql += field + " " + entry[field] + ","
    })

    sql = sql.substring(0, sql.length - 1) + ")"
    // console.log(sql)
    return sql
}
/**
 * 向指定表中插入数据，注意数据的大小，坐标字段用varchar太小
 * 首先判断表的类型，不需要的字段不再插入
 * @param tableName
 * @param objs
 * @returns {string}
 */
const insertSQL = function (tableName, objs) {
    if (!objs.length) {
        console.log('obj数组对象为null，无需插入')
        return
    }
    let fields = "(" + Object.keys(objs[0]).toString() + ")"
    let values = ""
    objs.forEach(obj => {
        // 将其第一层非基本类型的属性值转成字符串
        for (let key in obj) {
            if (typeof obj[key] === "object" || obj[key] === undefined) {
                obj[key] = JSON.stringify(obj[key])
            }
        }

        let temStr = JSON.stringify(Object.values(obj))
        values += "(" + temStr.substring(1, temStr.length - 1) + "),"
    })
    values = values.substring(0, values.length - 1)

    let sql = `INSERT INTO ${tableName} ${fields} VALUES  ${values}`;
    // console.log(sql)
    return sql

}
const getColumnSQL = function (tableName) {
    return `select COLUMN_NAME from information_schema.COLUMNS where table_name = '${tableName}' and table_schema = '${db.name}'`;
}
const exisTable = function (tableName) {
    // return `SELECT DISTINCT t.table_name, n.SCHEMA_NAME FROM information_schema.TABLES t, information_schema.SCHEMATA n WHERE t.table_name = '${tableName}' AND n.SCHEMA_NAME = '${db.name}'`;
    return `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${db.name}' and t.TABLE_NAME ='${tableName}';`
}

const quaryTBTables = function () {
    return `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${db.name}' and t.TABLE_NAME like 'zj%' `
}

const deleteSQL = function (tableName, condition,) {

}
const updateSQL = function (tableName, content, condition = {}) {
    // 这里对condition判断
    let sql = `update ${tableName} set `
    for (let key in content) {
        sql += ` ${key}=${JSON.stringify(content[key])},`
    }
    sql = sql.substring(0, sql.length - 1)
    // if(JSON.stringify(condition)!=="{}"){
    //     sql += ` where `
    //     for (let key in condition) {
    //         sql += ` ${key}=${condition[key]} and`
    //     }
    //     sql = sql.substring(0, sql.length - 3)
    // }
    sql += SQL.where(condition)
    return sql

}
const selectSQL = function (tableName, condition) {

    // let sql = `select * from ${tableName} where `
    // for (let key in condition) {
    //     // condition[key]可能是Number和字符串类型
    //     // 有百分号%，都给他序列化为字符串
    //     if (String(condition[key]).indexOf('%') !== -1) {
    //         sql += ` ${key} like ${JSON.stringify(condition[key])} and`
    //     } else {
    //         sql += ` ${key} = ${JSON.stringify(condition[key])} and`
    //     }
    // }
    // sql = sql.substring(0, sql.length - 3)
    let sql = `select *  from  ${tableName}`
    // if(/\d{4}/.test(tableName)) {
    //     sql = `select ${displayFields} from ${tableName} `
    // }
    sql += SQL.where(condition)
    return sql

}

const statisticSQL = function () {

}

module.exports = {
    exist(tableName, callback) {
        let exitSql = exisTable(tableName)
        db.query(exitSql, function (err, res, fields) {
            if (!err) { // exit成功
                if (!res.length) {
                    //没有这个表
                    callback(false)
                    return
                } else {
                    callback(true)
                    return
                }
            }
        })
    },
    // 默认只新建图斑表
    created(tableName, callback, entity = "tuban") {
        let objModel = entity === 'tuban' ? tuban : status
        let sql = createSQL(tableName, objModel)
        db.query(sql, function (err, res, fields) {
            if (err) {
                // console.log(err)
                callback(false, res, fields)
                return
            }
            callback(true, res, fields)
        })
    },
    /**
     * 默认是追加的模式，插入的对象的键的集合一定要是entry的子集
     * @param tableName
     * @param rows
     */
    insert(tableName, rows, type, callback, mode = 'append') {
        // 先看看是不是存在已有的表格，如果存在，就追加还是清理空？先不考虑，考虑的话后面要加一个参数mode
        // let entry = type === 'tuban' ? tuban : user
        let entry
        switch (type) {
            case 'status':
                entry = status
                break
            case  'user':
                entry = user
                break
            default:
                entry = tuban
        }
        // let exitSql = exisTable(tableName)

        let insertSql = insertSQL(tableName, rows)

        if (mode === "append") {
            db.query(insertSql, function (err, res, fields) {
                if (err) {
                    // console.log(err)
                    callback(false, 0)
                    return
                } else {
                    // console.log(`${tableName}插入${res.affectedRows}条数据`)
                    callback(true, res.affectedRows)
                }
            })
        } else {
            // 清空后再插入
            db.query(`truncate table ${tableName}`, function (err, res, field) {
                if (!err) {
                    db.query(insertSql, function (err, res, fields) {
                        if (err) {
                            // console.log(err)
                            throw new Error(err)
                            callback(false, 0)
                            return
                        } else {
                            // console.log(`${tableName}已清空，插入${res.affectedRows}条数据`)
                            callback(true, res.affectedRows)
                        }
                    })
                }
            })
        }


    },
    update(tableName, content, condition, callback) {
        let sql = updateSQL(tableName, content, condition)
        db.query(sql, function (err, res, fields) {
            if (err) {
                // console.log(tableName + ' update failed', err)
                callback(false, {})
                return
            } else {
                // console.log(tableName + ' update success')
                callback(true, {matchRows: res.affectedRows, changedRows: res.changedRows})
                return;
            }

        })

    },
    /**
     * 选择成功在回调中返回选中的数据
     * @param tableName
     * @param condition
     * @param callback
     */
    select(tableName, condition, callback) {
        let sql = selectSQL(tableName, condition)
        db.query(sql, function (err, res, fields) {
            if (err) {
                // console.log(err)
                callback(false, [])
                return
            } else {
                // console.log(Object.prototype.toString.call(res[0]))
                callback(true, Array.from(res))
            }
        })
    },
    getColumns(tableName, callback) {
        let getColumn = getColumnSQL(tableName)

        db.query(getColumn, function (err, res, fields) {
            let columns = []
            if (err) {
                // console.log(err)
                callback(false)
                return
            }
            // 获取到columns
            res.forEach(x => {
                columns.push(x['COLUMN_NAME'])
            })
            callback(true, columns)
        })

    }
}





