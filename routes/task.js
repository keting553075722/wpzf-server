/**
 * @Author : zzhe
 * @Date : 2021/10/10 15:02
 * @Description : task
 */
const express = require('express');
const router = express.Router();
const task = require('../db/entities/task')
const appendFields = require('../db/properties/tuban/append-fields.json')
const zjVisibleFields = require('../db/properties/visibleFields/zj.js')
const {cloneDeep} = require('lodash')
const moment = require('moment')
const Token = require('../model/token')
const response = require('../model/response-format')

router.post('/add', async function (req, res, next) {
    try {
        const token = req.headers.authorization
        const {name, code, permission} = Token.de(token) // 权限判断一下

        const {Id, Name, FieldsDetails, Define, Description} = req.body
        const CreateTime = getCurrentTime()
        const Creator = name
        const lastUpdateTime = CreateTime
        const lastUpdateName = Creator
        const waitAdd = {Id, Name, FieldsDetails, Description, CreateTime, Creator,lastUpdateTime,lastUpdateName}
        let define = {}
        waitAdd['Define'] = define
        FieldsDetails.forEach(field => {
            define[field.nameEn] = field.type
        })
        define['JCBH'] = "VARCHAR(255) PRIMARY KEY"
        define = Object.assign(define, appendFields)
        const addRes = await task.add([waitAdd]).then(res => res).catch(console.log)
        addRes && addRes.results ? response.responseSuccess(addRes.results, res) : response.responseFailed(res, '模板Id冲突')
    } catch (e) {
        console.log('/task/add', e.message)
        response.responseFailed(res, e.message)
    }
})

router.post('/updateTemplate', async function (req, res, next) {
    try {
        const token = req.headers.authorization
        const {name, code, permission} = Token.de(token) // 权限判断一下
        let {Id, Name,FieldsDetails} = req.body
        const lastUpdateTime = getCurrentTime()
        const lastUpdateName = name
        FieldsDetails = JSON.stringify(FieldsDetails)
        const content = {Name,FieldsDetails,lastUpdateTime,lastUpdateName}
        const updateRes = await task.update(content,{Id}).then(res => res).catch(console.log)
        updateRes && updateRes.results ? response.responseSuccess(updateRes.results, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/task/updateTemplate', e.message)
        response.responseFailed(res, e.message)
    }
})

router.get('/get', async function (req, res, next) {
    try {
        const token = req.headers.authorization
        const {name, code, permission} = Token.de(token) // 权限判断一下
        const {Id, Name} = req.query
        let fields = []
        Id && fields.push(Id)
        Name && fields.push(Name)
        const getRes = await task.find(fields).then(res => res).catch(console.log)
        let appendData = [{"Id": "zj","Name": "省级卫片"},{"Id": "sjsh","Name": "省级审核"}]
        // let returnData = appendData.concat(getRes.results)
        getRes && getRes.results ? response.responseSuccess(appendData.concat(getRes.results), res) : response.responseFailed(res)
    } catch (e) {
        console.log('/task/get', e.message)
        response.responseFailed(res, e.message)
    }
})
//{
//     "XZQDM": "行政区代码",
//     "SMC": "省名称",
//     "CMC": "市名称",
//     "Shape_Area": "图斑图形面积"
// }
router.get('/getfields', async function (req, res, next) {
    try {
        const {Id, allfields} = req.query
        let resFields = {}
        if(Id && Id !== 'zj') {
            let fields = ['FieldsDetails']
            const getRes = await task.find(fields, {Id}).then(res => res).catch(console.log)
            let dbFields = getRes && getRes.results[0] ? getRes.results[0]['FieldsDetails'] :'[]'
            dbFields = allfields ? JSON.parse(dbFields) : JSON.parse(dbFields).filter(itm => itm['isVisible'] == '是')
            for (let dbField of dbFields) {
                resFields[dbField['nameEn']] = dbField['name']
            }
        } else if(Id == 'zj') {
            resFields  = cloneDeep(zjVisibleFields)
        }
        if(!allfields) {
            delete resFields['JCBH']
        }
        response.responseSuccess(resFields, res)
    } catch (e) {
        console.log('/task/getfields', e.message)
        response.responseFailed(res, e.message)
    }
})

module.exports = router