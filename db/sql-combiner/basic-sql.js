/**
 * @Description:
 * @author zzh
 * @createTime 2021/3/31
 */
const db = require('../db')
const SQL = require('./utils')
const tuban = require('../properties/tuban-definition.json')
const excel = require('../properties/excel-definition.json')
const user = require('../properties/user_definition.json')
const status = require('../properties/status_definition.json')

/**
 * 根据entry实体创建表
 * @param tableName
 * @param entity 默认是图斑
 * @returns {string}
 */
const createTableSQL = function (tableName, entity = tuban) {
    // 根据tableName，entry实体创建表
    // 组装sql
    let fields = Object.keys(entity)
    let sql = `CREATE TABLE ${tableName} (`
    fields.forEach(field => {
        sql += field + " " + entity[field] + ","
    })
    sql = sql.substring(0, sql.length - 1) + ")"
    return sql
}
/**
 * 根据entry实体创建表
 * @param tableName
 * @param entity 默认是图斑
 * @returns {string}
 */
const createExcelTableSQL = function (tableName, entity = excel) {
    // 根据tableName，entry实体创建表
    // 组装sql
    let fields = Object.keys(entity)
    let sql = `CREATE TABLE ${tableName} (`
    fields.forEach(field => {
        sql += field + " " + entity[field] + ","
    })
    sql = sql.substring(0, sql.length - 1) + ")"
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
    return sql

}

/**
 * 获取指定表的所有列
 * @param tableName
 * @returns {string}
 */
const getColumnSQL = function (tableName) {
    return `select COLUMN_NAME from information_schema.COLUMNS where table_name = '${tableName}' and table_schema = '${db.name}'`;
}

/**
 * 判断是否存在某张表
 * @param tableName
 * @returns {string}
 */
const exisTableSQL = function (tableName) {
    // return `SELECT DISTINCT t.table_name, n.SCHEMA_NAME FROM information_schema.TABLES t, information_schema.SCHEMATA n WHERE t.table_name = '${tableName}' AND n.SCHEMA_NAME = '${db.name}'`;
    return `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${db.name}' and t.TABLE_NAME ='${tableName}';`
}

/**
 * 指定数据库查询具有统一标识的表名
 * @param identifier
 * @returns {string}
 */
const quaryAllTableNameSQL = function (identifier = 'zj') {
    return `select t.table_name from information_schema.TABLES t where t.TABLE_SCHEMA ='${db.name}' and t.TABLE_NAME like '${identifier}%' `
}

/**
 * 指定表中删除指定记录
 * @param tableName
 * @param condition
 */
const deleteSQL = function (tableName, condition,) {

}

/**
 * 更新指定表的指定记录
 * @param tableName
 * @param content
 * @param condition
 * @returns {string}
 */
const updateSQL = function (tableName, content, condition = {}) {
    // 这里对condition判断
    let sql = `update ${tableName} set `
    for (let key in content) {
        sql += ` ${key}=${JSON.stringify(content[key])},`
    }
    sql = sql.substring(0, sql.length - 1)
    sql += SQL.where(condition)
    return sql
}

/**
 * 查询指定表的指定记录
 * @param tableName
 * @param condition
 * @returns {string}
 */
const selectSQL = function (tableName, condition) {

    let sql = `select *  from  ${tableName}`
    sql += SQL.where(condition)
    return sql

}

module.exports = {
    createTableSQL,
    insertSQL,
    getColumnSQL,
    exisTableSQL,
    quaryAllTableNameSQL,
    deleteSQL,
    updateSQL,
    selectSQL,
    createExcelTableSQL
}





