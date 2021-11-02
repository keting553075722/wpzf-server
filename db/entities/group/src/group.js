/**
 * @Description: groups
 * @author zzh
 * @createTime 2021/11/2
 */
const db = require('../../../table-operator')

module.exports = {
    /**
     *
     * 回调函数返回一个查询状态和对象
     * @param user {uid}
     * @param callback
     */
    findByCode(code) {
        return db.find('groups', {code: code}, [], [])
    },
    insert() {
    },
    update() {
    },
    batchUpdate() {
    }

}
