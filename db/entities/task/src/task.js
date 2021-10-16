/**
 * @Author : zzhe
 * @Date : 2021/10/10 14:48
 * @Description : task.js
 */

const db = require('../../../table-operator')

module.exports = {
    /**
     * 查询模板
     * @param fields
     * @param condition
     * @returns {Promise<unknown>}
     */
    find(fields, condition={}) {
        return db.find('task_template', condition, fields)
    },

    /**
     * 添加新的任务模板
     * @param objs
     * @returns {Promise<unknown>}
     */
    add(objs) {
        return db.insert('task_template', objs)
    },

    update(content, condition) {
        return db.update('task_template', content, condition)
    }


}

