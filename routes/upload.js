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
const moment = require('moment')
const path = require('path')
const mkdirp = require('mkdirp')

const imgUpload = require('../model/multer-config/multer-imgs-upload')
const attachmentUpload = require('../model/multer-config/multer-attachment-upload')
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
const multiparMiddleware = multer()
const excelKey = require('../db/properties/excel/excel-annotation.json')

/**
 * 配置文件上传下载相关的路由
 */

// 新建任务/接续上传两种 todo
// post请求，携带上传的zip格式的文件
router.post('/file', fileUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let file = req.file
        let {year, jd, ly} = JSON.parse(req.body.info)
        let incomeTable = `zj_${year}_${jd}`
        let fileName = `${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`
        let filePath = path.join(__dirname, "../resources/uploads/shapefiles/") + incomeTable + '/' + moment().format("YYYY-MM-DD")
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

router.post('/img', imgUpload.any(), async function (req, res, next) {
    try {
        let files = req.files
        let {tubanId, tableName} = JSON.parse(req.body.info)
        let tblj = []
        let serverIp = await config.serverIp().then(res => res).catch(console.log)
        let sliceNum = config.serverEnv == 'windows' ? 5 : 6

        for (const file of files) {
            let path = file.path
            let pathArr = path.split(config.splitChar)
            console.log('pathArr',pathArr)
            pathArr = pathArr.slice(sliceNum)
            path = `http://${serverIp}:${config.appPort}/${pathArr.join("/")}`
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

router.post('/attachment', attachmentUpload.any(), async function (req, res, next) {
    try {
        let files = req.files
        let {tubanId, tableName} = JSON.parse(req.body.info)
        let fjlj = []
        let serverIp = await config.serverIp().then(res => res).catch(console.log)
        let sliceNum = config.serverEnv == 'windows' ? 5 : 6

        for (const file of files) {
            let path = file.path
            let pathArr = path.split(config.splitChar)
            pathArr = pathArr.slice(sliceNum)
            path = `http://${serverIp}:${config.appPort}/${pathArr.join("/")}`
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

router.post('/excel', excelUpload, async function (req, res, next) {
    try {
        let user = Token.de(req.headers.authorization)
        let file = req.file
        let {year, jd, ly} = JSON.parse(req.body.info)
        let incomeTable = `sjsh_${year}_${jd}`
        let fileName = `${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`
        let filePath = path.join(__dirname, "../resources/uploads/excel/") + incomeTable + '/' + moment().format("YYYY-MM-DD")
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

        console.log('excelData',excelData)
        let importRes = await Tuban.importExcel(incomeTable, excelData)

        importRes && importRes.results ? response.responseSuccess(importRes.results.message, res) : response.responseFailed(res)


    } catch (e) {
        console.log('/upload/shapefile ', e.message)
        response.responseFailed(res, e.message)
    }
});

router.get('/download', function (req, res, next) {

})



module.exports = router
