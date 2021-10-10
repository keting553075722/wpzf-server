/**
 * @Author : zzhe
 * @Date : 2021/10/10 15:02
 * @Description : task
 */
const express = require('express')
const router = express.Router()
const task = require('../db/entities/task')
const moment = require('moment')
const Token = require('../model/token')
const response = require('../model/response-format')

router.post('/add', async function (req, res, next) {
    try{
        const token = req.headers.authorization
        const {name, code, permission} = Token.de(token) // 权限判断一下

        const {Id, Name, Define, Description} = req.body
        const CreateTime = moment().format("YYYY-MM-DD HH:mm:ss")
        const Creator = name
        const waitAdd = {Id, Name, Define, Description, CreateTime, Creator}

        const addRes = task.add(waitAdd).then(res => res).catch(console.log)
        addRes && addRes.results ? response.responseSuccess(addRes.results.message, res) : response.responseFailed(res)
    }catch (e) {
        console.log('/task/add', e.message)
        response.responseFailed(res, e.message)
    }
})