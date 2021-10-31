/**
 * @Description: 封装对User表的一些操作
 * @author zzh
 * @createTime 2021/4/1
 */
const db = require('../../../table-operator')
module.exports = {
    /**
     * 接收一个用户名密码的user对象作为查询条件
     * 回调函数返回一个查询状态和对象
     * @param user
     * @param callback
     */
    find(user) {
        return db.find('users', user)
    },
    insert() {
    },
    update() {
    },
    batchUpdate() {
    }

}
