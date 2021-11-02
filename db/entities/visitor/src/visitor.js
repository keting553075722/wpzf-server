/**
 * @Description: dd-user
 * @author zzh
 * @createTime 2021/10/3
 */
const db = require('../../../table-operator')
const tableName = 'visitors'
module.exports = {
    /**
     *
     * 回调函数返回一个查询状态和对象
     * @param user {uid}
     * @param callback
     */
    findAll() {
        return db.find(tableName, {}, [], [])
    },
    findByAccountId(accountId) {
        return db.find(tableName, {accountId: accountId}, [],[])
    },
    /**
     * 添加一个新访客
     * @param visitor
     * @returns {Promise<unknown>}
     */
    add(visitor) {
        return db.insert(tableName, [visitor])
    },
    /**
     * 允许访客进入系统
     * @param accountId
     * @returns {Promise<unknown>}
     */
    allow(accountId) {
        return db.update(tableName, {'_is_allow': '1'}, {accountId: accountId})
    },
    /**
     * 根据Id移除访客
     * @param accountId
     * @returns {Promise<unknown>}
     */
    removeByAccountId(accountId) {
        return db.delete(tableName, {accountId: accountId})
    }

}
