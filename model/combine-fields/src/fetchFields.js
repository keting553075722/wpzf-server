/**
 * @Author : zzhe
 * @Date : 2021/10/17 12:35
 * @Description : fetchFields
 */
const task = require('../../../db/entities/task')
const businessFields = require('../../../db/properties/tuban/business-fields.json')
const appendFields = require('../../../db/properties/tuban/append-fields.json')
const zjFields = require('../../../db/properties/tuban/zj-fields.json')
module.exports = async function (id = 'zj') {
    let fieldsDefine = {}
    if(id == 'zj') {
        fieldsDefine = {...zjFields}
    } else {
        let findRes = await task.find(['Define'], {Id: id}).then(res => res).catch(console.log)
        findRes && findRes.results && findRes.results.length && (fieldsDefine = {...JSON.parse(findRes.results[0]['Define'])})
    }

    fieldsDefine =  fieldsDefine['JCBH'] ? {...fieldsDefine, ...appendFields, ...businessFields} : {}
    return fieldsDefine
}