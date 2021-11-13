/**
 * @description:
 * @author zzh
 * @createTime 2021/4/7
 */

const express = require('express')
const router = express.Router()
const Token = require('../model/token')
const {fileUpload} = require('../model/multer-config/multer-files-upload')
const {excelUpload} = require('../model/multer-config/multer-excel-upload')
const {imageUpload} = require('../model/multer-config/multer-imgs-upload')
const {attachmentUpload} = require('../model/multer-config/multer-attachment-upload')
const moment = require('moment')
const path = require('path')
const mkdirp = require('mkdirp')


const shapefile = require('../model/utils/shapefile')
const Tuban = require('../db/entities/tuban')
const compressing = require('compressing')
const fs = require('fs')
const getNames = require('../model/utils/getNames')
const getCodes = require('../model/utils/getCodes')
const response = require('../model/response-format')
const config = require('../deploy-config/src/config')
const ip = require('ip')
const publicIp = require('public-ip')

const multer = require('connect-multiparty')
const XLSX= require('xlsx');
const excelKey = require('../db/properties/excel/excel-annotation.json')

/**
 * 配置文件上传下载相关的路由
 */

// 新建任务/接续上传两种 todo
// post请求，携带上传的zip格式的文件
router.post('/shapefile', fileUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let file = req.file
        let {Id, year, jd, ly} = req.query
        let incomeTable = `${Id}_${year}_${jd}`
        let fileName = `${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`
        let filePath = path.join(__dirname, "../resources/uploads/shapefiles/") + `${Id}/${year}/${jd}` + '/' + moment().format("YYYY-MM-DD")
        mkdirp.sync(filePath)

        filePath = filePath + '/' + fileName
        fs.writeFileSync(filePath, req.file.buffer)

        let unZipPath = filePath.split('.')[0]
        mkdirp.sync(unZipPath)
        //开始解压
        let compressRes = await compressing.zip.uncompress(filePath, unZipPath).then(res => res).catch(console.log)
        let readDir = fs.readdirSync(unZipPath)
        let shpWithExt = readDir.filter(x => x.split('.')[1] === "shp")[0]
        let shpWithoutExt = shpWithExt.split('.')[0]
        let url = unZipPath + "\/" + shpWithoutExt

        let JsonData = await shapefile(url)
        JsonData.forEach((itm) => {
            let codes = getCodes(itm.XZQDM)
            Object.assign(itm, getNames(itm.XZQDM), codes)
        })
        console.log("省市属性、图斑来源已经插入！")
        let importRes = await Tuban.importTuban(incomeTable, JsonData)

        importRes && importRes.results ? response.responseSuccess(importRes.results.message, res) : response.responseFailed(res, importRes)

    } catch (e) {
        console.log('/upload/shapefile ', e.message)
        response.responseFailed(res, e.message)
    }
})

router.post('/img', imageUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let files = req.files
        let {tubanId, tableName} = req.query
        let tableInfo = getInfo(tableName)
        let fileName
        let filePathWin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}\\${tableInfo.year}\\${tableInfo.batch}\\${tubanId}`+`\\images`
        let filePathLin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}/${tableInfo.year}/${tableInfo.batch}/${tubanId}/images`
        let filePath = config.serverEnv == 'windows' ? filePathWin : filePathLin
        mkdirp.sync(filePath)
        let filePathArr = []
        for (let file of files) {
            let tempPath = ''
            fileName = `${moment().format("YYYY-MM-DD HH时mm分ss秒")}--${user.name}--${file.originalname}`
            tempPath = filePath + config.splitChar + fileName
            fs.writeFileSync(tempPath, file.buffer)
            filePathArr.push(tempPath)
        }

        let tblj = []
        let serverIp = await config.serverIp().then(res => res).catch(console.log)

        for (let filePathArrElement of filePathArr) {
            let pathArr = filePathArrElement.split(config.splitChar)
            pathArr = pathArr.slice(-7)
            let path = `http://${serverIp}:${config.appPort}/${pathArr.join("/")}`
            tblj.push(path)
        }

        let condition = {JCBH: tubanId}
        let content = {TPLJ: JSON.stringify(tblj)}
        let dbRes = await Tuban.update(tableName, content, condition).then(res => res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/upload/img', e.message)
        response.responseFailed(res, e.message)
    }
});

router.post('/attachment', attachmentUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let files = req.files
        let {tubanId, tableName, Id} = req.query
        let tableInfo = getInfo(tableName)
        let fileName
        let filePathWin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}\\${tableInfo.year}\\${tableInfo.batch}\\${tubanId}`+`\\attachments`
        let filePathLin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}/${tableInfo.year}/${tableInfo.batch}/${tubanId}/attachments`
        let filePath = config.serverEnv == 'windows' ? filePathWin : filePathLin
        mkdirp.sync(filePath)
        let filePathArr = []
        for (let file of files) {
            let tempPath = ''
            fileName = `${moment().format("YYYY-MM-DD HH时mm分ss秒")}--${user.name}--${file.originalname}`
            tempPath = filePath + config.splitChar + fileName
            fs.writeFileSync(tempPath, file.buffer)
            filePathArr.push(tempPath)
        }

        let fjlj = []
        let serverIp = await config.serverIp().then(res => res).catch(console.log)

        for (let filePathArrElement of filePathArr) {
            let pathArr = filePathArrElement.split(config.splitChar)
            pathArr = pathArr.slice(-7)
            let path = `http://${serverIp}:${config.appPort}/${pathArr.join("/")}`
            fjlj.push(path)
        }

        let condition = {JCBH: tubanId}
        let content = {FJLJ: JSON.stringify(fjlj)}

        let dbRes = await Tuban.update(tableName, content, condition).then(res => res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/upload/attachment', e.message)
        response.responseFailed(res, e.message)
    }
});

router.post('/projectattachment', attachmentUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let files = req.files
        let {tubanId, tableName, Id} = req.query
        let tableInfo = getInfo(tableName)
        let fileName
        let filePathWin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}\\${tableInfo.year}\\${tableInfo.batch}\\${tubanId}`+`\\projectAttachments`
        let filePathLin = path.join(__dirname, "../resources/evidence/") + `${tableInfo.Id}/${tableInfo.year}/${tableInfo.batch}/${tubanId}/projectAttachments`
        let filePath = config.serverEnv == 'windows' ? filePathWin : filePathLin
        mkdirp.sync(filePath)
        let filePathArr = []
        for (let file of files) {
            let tempPath = ''
            fileName = `${moment().format("YYYY-MM-DD HH时mm分ss秒")}--${user.name}--${file.originalname}`
            tempPath = filePath + config.splitChar + fileName
            fs.writeFileSync(tempPath, file.buffer)
            filePathArr.push(tempPath)
        }

        let fjlj = []
        let serverIp = await config.serverIp().then(res => res).catch(console.log)

        for (let filePathArrElement of filePathArr) {
            let pathArr = filePathArrElement.split(config.splitChar)
            pathArr = pathArr.slice(-7)
            let path = `http://${serverIp}:${config.appPort}/${pathArr.join("/")}`
            fjlj.push(path)
        }

        let condition = {JCBH: tubanId}
        let content = {XMFJ: JSON.stringify(fjlj)}

        let dbRes = await Tuban.update(tableName, content, condition).then(res => res).catch(console.log)
        dbRes && dbRes.results ? response.responseSuccess(dbRes.results.message, res) : response.responseFailed(res)
    } catch (e) {
        console.log('/upload/projectattachment', e.message)
        response.responseFailed(res, e.message)
    }
});

router.post('/excel', excelUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let file = req.file
       /* let {Id, year, jd, ly} = JSON.parse(req.body.info)*/
        let {Id, year, jd, ly} = req.query
        let incomeTable = `${Id}_${year}_${jd}`
        let fileName = git`${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`
        let filePath = path.join(__dirname, "../resources/uploads/excel/") + `${Id}/${year}/${jd}` + '/' + moment().format("YYYY-MM-DD")
        mkdirp.sync(filePath)

        filePath = filePath + '/' + fileName
        fs.writeFileSync(filePath, req.file.buffer)

        let excelData = [];   //用来保存
        let reqData = [];
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                //fromTo = workbook.Sheets[sheet]['!ref'];
                //解析excel文件得到数据
                excelData = excelData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet],{
                    header:0,
                    defval:"null"
                }));
            }
        }
        for(var i=0;i<excelData.length;i++){
            var obj = excelData[i]
            for(var key in obj){
                var newKey=excelKey[key]
                if(newKey){
                    obj[newKey]=obj[key]
                    delete obj[key]
                }
            }
        }
        let importRes = await Tuban.importExcel(incomeTable, excelData)
        importRes && importRes.results ? response.responseSuccess(importRes.results.message, res) : response.responseFailed(res)


    } catch (e) {
        console.log('/upload/excel ', e.message)
        response.responseFailed(res, e.message)
    }
});

router.get('/download', function (req, res, next) {

})



module.exports = router
