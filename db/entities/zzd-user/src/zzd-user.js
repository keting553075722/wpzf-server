/**
 * @Description: zzd-user
 * @author zzh
 * @createTime 2021/10/3
 */
const db = require('../../../table-operator')
const currentTime = require('../../../../model/get-current-time')
const tableName = 'zzd_users'
module.exports = {
  /**
   * 接收一个用户名密码的user对象作为查询条件
   * 回调函数返回一个查询状态和对象
   * @param user {uid}
   * @param callback
   */
  findByUid(uid) {
    return db.find(tableName, {uid: uid}, [], [])
  },
  /**
   * 根据用户组查询
   * 回调函数返回一个查询状态和对象
   * @param user {uid}
   * @param callback
   */
  findByGroupCode(code) {
    return db.find(tableName, {group_code: code}, [], [])
  },
  /**
   * 根据姓名密码查询
   * @param name
   * @param pwd
   * @returns {Promise<unknown>}
   */
  findByPwd(name, pwd) {
    return db.find(tableName, {name: name, password: pwd}, [], [])
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
   * 更新用户分组
   * @param uid
   * @param group_code
   * @returns {Promise<unknown>}
   */
  updateGroup(uid, group_code, name = '') {
    return db.update(tableName, {group_code: group_code, authorizer: name, last_update_time: currentTime()}, {uid: uid})
  },
  /**
   * 更新用户权限
   * @param uid
   * @param auth
   * @returns {Promise<unknown>}
   */
  updateAuth(uid, auth = '', name = '') {
    return db.update(tableName, {auth: auth, authorizer: name, last_update_time: currentTime()}, {uid: uid})
  },
  /**
   * 更新用户名
   * @param uid
   * @param userName
   * @param name
   * @returns {Promise<unknown>}
   */
  updateUserName(uid, userName, name = '') {
    return db.update(tableName, {name: userName, authorizer: name, last_update_time: currentTime()}, {uid: uid})
  },
  /**
   * 根据Id移除用户
   * @param accountId
   * @returns {Promise<unknown>}
   */
  removeByUid(uid) {
    return db.delete(tableName, {uid: uid})
  },
  /**
   * 修改密码
   * @param uid
   * @param password
   * @param name
   * @returns {Promise<unknown>}
   */
  setPassword(uid, password, name = '') {
    return db.update(tableName, {password: password, authorizer: name, last_update_time: currentTime()}, {uid: uid})
  },
}
