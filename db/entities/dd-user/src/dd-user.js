/**
 * @Description: dd-user
 * @author zzh
 * @createTime 2021/10/3
 */
const db = require('../../../table-operator')

module.exports = {
    /**
     * 接收一个用户名密码的user对象作为查询条件
     * 回调函数返回一个查询状态和对象
     * @param user {uid}
     * @param callback
     */
    findByUid(uid) {
        return db.find('dd_user', {uid: uid})
    },
    insert() {
    },
    update() {
    },
    batchUpdate() {
    }

}
