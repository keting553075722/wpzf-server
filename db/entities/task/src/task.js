/**
 * @Author : zzhe
 * @Date : 2021/10/10 14:48
 * @Description : task.js
 */

const db = require('../../../table-operator')

module.exports = {
    /**
     * 查询所有的模板
     * @returns {Promise<unknown>}
     */
    find() {
        return db.find('task-template')
    },
    /**
     * 添加新的任务模板
     * @param objs
     * @returns {Promise<unknown>}
     */
    add(objs) {
        return db.insert('task-template', objs)
    }


}

