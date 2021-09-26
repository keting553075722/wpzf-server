/**
 * @Description: 封装对User表的一些操作
 * @author zzh
 * @createTime 2021/4/1
 */
const db = require('../operators')

module.exports = {
    /**
     * 接收一个用户名密码的user对象作为查询条件
     * 回调函数返回一个查询状态和对象
     * @param user
     * @param callback
     */
    find(user, callback) {
        db.select('users', user, function (tag, val) {
            if(tag && val.length != 0){
                callback(true,val[0])
            }else {
                callback(false,{})
            }

        })
    },
    insert() {
    },
    update() {
    },
    batchUpdate() {
    }

}
