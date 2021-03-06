/**
 * @Description:封装对tuban表的一些操作
 * @author zzh
 * @createTime 2021/4/1
 */
const db = require('../../../table-operator')
const excelInitializeProps = require('../../../properties/excel/excel-initialize')

module.exports = {
    /**
     * 查询指定条件的图斑记录
     * @param tableName
     * @param condition
     * @param limit
     * @returns {Promise<unknown>}
     */
    find(tableName, condition, limit) {
        return db.find(tableName, condition, [], limit)
    },

    /**
     * 模糊查询指定条件的图斑记录（用于图斑拆分）
     * @param tableName
     * @param condition
     * @returns {Promise<unknown>}
     */
    likefind(tableName, condition) {
        return db.likefind(tableName, condition)
    },

    /**
     * 插入一些记录，obj的模式要和对应表格的字段相匹配
     * @param tableName
     * @param objs
     * @returns {Promise<unknown>}
     */
    insert(tableName, objs) {
        return db.insert(tableName, objs)
    },

    /**
     * 删除图斑表中指定condition的记录
     * @param tableName
     * @param condition
     * @returns {Promise<unknown>}
     */
    delete(tableName, condition) {
        return db.delete(tableName, condition)
    },

    /**
     *
     * @param tableName
     * @param content
     * @param condition
     * @returns {Promise<unknown>}
     */
    update(tableName, content, condition) {
        return db.update(tableName, content, condition)
    },

    /**
     * 创建一张表
     * @param tableName
     * @returns {Promise<unknown>}
     */
    create(tableName) {
        return db.create(tableName)
    },

    /**
     * 获取图斑个数，不包含分割图斑
     * @param tableName
     * @param condition
     * @returns {Promise<unknown>}
     */
    getCount(tableName, condition) {
        return db.getCount(tableName, condition)
    },

    /**
     * 获取指定图斑编号的分割图斑
     * @param tableName
     * @param JCBH
     * @param condition
     * @param fields
     * @returns {Promise<unknown>}
     */
    getSplitInfo(tableName, JCBH, condition, fields) {
        return db.getSplit(tableName, JCBH, condition, fields)
    },

    /**
     * 创建一张表
     * @param tableName
     * @returns {Promise<unknown>}
     */
    createExcelTable(tableName) {
        return db. createExcelTable(tableName)
    },

    /**
     * 导入图斑，新建批次或者在原批次导入
     * @param tableName
     * @param objs
     * @returns {Promise<unknown>}
     */
    async importTuban(tableName, objs) {
        try {
            let msg = ''
            let exist = await db.exist(tableName)
            !exist.results.length && await this.create(tableName)
            let insertStatus = await this.insert(tableName, objs).then(res=>res).catch(err=>{console.log(err.message);msg = err.message})
            !insertStatus && await this.dropTable(tableName)
            return msg ? msg : insertStatus
        } catch (e) {
            console.log('import failed ', e.message)
        }
    },

    async dropTable(tableName) {
        try {
            let exist = await db.exist(tableName)
            exist.results.length && await db.drop(tableName)
            return true
        } catch (e) {
            console.log('drop failed ', e.message)
        }
    },

    /**
     * 导入Excel表，新建批次或者在原批次导入
     * @param tableName
     * @param objs
     * @returns {Promise<unknown>}
     */
    async importExcel(tableName, objs) {
        try {
            let msg = ''
            let exist = await db.exist(tableName)
            !exist.results.length && await this.createExcelTable(tableName)
            let insertStatus = await this.insert(tableName, objs).then(res=>res).catch(err=>{console.log(err.message);msg = err.message})
            !insertStatus && await this.dropTable(tableName)
            return msg ? msg : insertStatus
        } catch (e) {
            console.log('import failed ', e.message)
        }
    },


    /**
     * 查询指定表的所有字段
     * @tableName
     * @returns {Promise<unknown>}
     */
    getFields(tableName) {
        return db.getFields(tableName)
    },

    /**
     * 查询储存图斑的所有的表，模式sjsh%
     * @returns {Promise<unknown>}
     */
    sjshqueryTBTables() {
        return db.sjshqueryTBTables()
    },
    queryTBTables(Id) {
        return db.queryTBTables(Id)
    }

}
