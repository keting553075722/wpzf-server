/**
 * @Description: dd-user
 * @author zzh
 * @createTime 2021/10/3
 */
const db = require('../../../table-operator')
const tableName = 'zzd_users'
module.exports = {
    /**
     * 接收一个用户名密码的user对象作为查询条件
     * 回调函数返回一个查询状态和对象
     * @param user {uid}
     * @param callback
     */
    findByUid(uid) {
        return db.find(tableName, {uid: uid}, [],[])
    },
    /**
     * 根据姓名密码查询
     * @param name
     * @param pwd
     * @returns {Promise<unknown>}
     */
    findByPwd(name, pwd) {
        return db.find(tableName, {name: name, password: pwd}, [],[])
    },
    /**
     * 回调函数返回一个查询状态和对象
     * @param user {uid}
     * @param callback
     */
    findAll() {
        return db.find(tableName, {}, [], [])
    },
    /**
     * 添加一个新访客
     * @param visitor
     * @returns {Promise<unknown>}
     */
    add(user) {
        return db.insert(tableName, [user])
    },
    /**
     * 根据Id移除访客
     * @param accountId
     * @returns {Promise<unknown>}
     */
    removeByAccountId(uid) {
        return db.delete(tableName, {uid: uid})
    },
    setPassword(uid, password) {
        return db.update(tableName, {password: password}, {uid:uid})
    },
}
