/**
 * @Author : zzhe
 * @Date : 2021/10/14 10:52
 * @Description : main.js
 */
const Task = require('../../../db/entities/task')
module.exports =async function (Id) {
    let findRes = await Task.find(['FieldsDetails'], {Id}).then(res => res).catch(console.log)

}