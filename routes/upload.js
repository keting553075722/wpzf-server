/**
 * @description:
 * @author zzh
 * @createTime 2021/4/7
 */

const express = require('express')
const router = express.Router()
const Token = require('../model/token')
const {fileUpload} = require('../model/multer-config/multer-files-upload')
const moment = require('moment')
const path = require('path')
const mkdirp = require('mkdirp')

const imgUpload = require('../model/multer-config/multer-imgs-upload')
const attachmentUpload = require('../model/multer-config/multer-attachment-upload')
const shapefile = require('../model/utils/shapefile')
const tuban = require('../db/entities/tuban')
const status = require('../db/entities/status')
const compressing = require('compressing')
const fs = require('fs')
const ip = require('ip')
const publicIp = require('public-ip')
const setProps = require('../model/utils/setProps')
const getNames = require('../model/utils/getNames')
const getCodes = require('../model/utils/getCodes')

/**
 * 配置文件上传下载相关的路由
 */
const response = {
    status: false,
    msg: 'failed',
    data: {}
}

// 新建任务/接续上传两种 todo
// post请求，携带上传的zip格式的文件
router.post('/file', fileUpload, function (req, res, next) {
    let user = Token.de(req.headers.authorization).tokenKey
    let file = req.file
    let {year, jd, ly} = JSON.parse(req.body.info)
    let incomeTable = `zj_${year}_${jd}`
    let fileName = `${moment().format("HH时mm分ss秒")}--${user.name}--${file.originalname}`
    let filePath = path.join(__dirname, "../resources/uploads/files/") + incomeTable + '/' + moment().format("YYYY-MM-DD")
    mkdirp.sync(filePath)
    filePath = filePath + '/' + fileName
    fs.writeFileSync(filePath, req.file.buffer)

    // todo 此处需要一个解压，假设已经解压完毕，并返回一个解压后文件夹的url
    // 解压后的路径为
    let unZipPath = filePath.split('.')[0]
    mkdirp.sync(unZipPath)
    //开始解压
    compressing.zip.uncompress(filePath, unZipPath).then(
        () => {
            let readDir = fs.readdirSync(unZipPath)
            let shpWithExt = readDir.filter(x => x.split('.')[1] === "shp")[0]
            let shpWithoutExt = shpWithExt.split('.')[0]
            let url = unZipPath + "\/" + shpWithoutExt
            shapefile(url, function (tag, data) {
                    if (!tag) {
                        res.send({
                            status: false
                        })
                        return
                    }
                    // data是json数组，这里要对数组进行一些操作
                    data.forEach((itm) => {
                        let codes = getCodes(itm.XZQDM)
                        try {
                            Object.assign(itm, getNames(itm.XZQDM), codes, {TBLY: ly})
                        } catch (e) {
                            console.log('e', e)
                        }

                    })
                    // 插入省市属性
                    console.log("省市属性、图斑来源已经插入！")

                    tuban.exist(incomeTable, function (tag) {
                        if (tag) {
                            // 继续向incomeTable中插入数据，插入的模式为 append
                            tuban.insertAndInitialize(incomeTable, data, function (tag, affectedRows) {
                                if (tag) {
                                    // 这里插入成功后执行的操作。
                                    // console.log(affectedRows)
                                    res.send({
                                        status: true,
                                        affectedRows
                                    })
                                } else {
                                    res.send({
                                        status: false
                                    })
                                    return
                                }
                            }, "append")

                            // 判断是否是工作表，如果不是，将其更改为工作状态
                            // if (!global.$workTables.includes(incomeTable)) {
                            //     global.$workTables.pushItem(incomeTable)
                            // }
                        } else {
                            // 数据库中没有这张表
                            tuban.create(incomeTable, function (tag) {
                                if (tag) {
                                    console.log(`${incomeTable}创建成功`)
                                    tuban.insertAndInitialize(incomeTable, data, function (tag, affectedRows) {
                                        if (tag) {
                                            console.log(`新建${incomeTable}插入数据成功`)
                                            res.send({
                                                status: true
                                            })
                                            // global.$workTables.pushItem(incomeTable)
                                            return
                                        } else {
                                            res.send({
                                                status: false
                                            })
                                            return
                                        }
                                    }, 'clear')
                                } else {
                                    res.send({
                                        status: false
                                    })
                                    return
                                }
                            })
                        }
                    })
                }
            )
        })
        .catch((err) => {
            // console.log(err)
            res.send({
                status: false
            })
        })
})

router.post('/img', imgUpload.any(), function (req, res, next) {
    // 图片已经正确上传至指定文件夹，然后根据请求的数据将路径信息写入数据库。
    let files = req.files
    let {tubanId, tableName} = JSON.parse(req.body.info)
    let workTable = tableName
    // 构造condition
    let tblj = []
    // todo 对filepath进行拼接，拼接成静态资源服务器的地址
    // todo [ipAdress]:[port] // 市之后的
    if (environmentPRODEV === 'windows') {
        files.forEach(file => {
            // 对路径进行处理
            let path = file.path
            // windows 本地服务器要用到 '\\'
            // let pathArr = path.split('\\')
            // linux/windows 本地服务器要用到 '\/'
            let pathArr = path.split('\\')

            // windows截取到5，linux截取到6
            pathArr = pathArr.slice(5)
            // path = 'http://' + ip.address() + ":3000/" + pathArr.join("/")
            path = `http://${ip.address()}:${environmentPort}/${pathArr.join("/")}`
            tblj.push(path)

        })
        let condition = {
            JCBH: tubanId
        }
        let content = {
            TPLJ: JSON.stringify(tblj)
        }
        // 先获取原来的图斑路径
        // 直接覆盖掉原来的图斑路径

        tuban.update(workTable, content, condition, function (tag, result) {
            if (tag) {
                response.status = tag
                response.msg = 'upload success'
                response.data = result
            }
            res.send(response)
        })
    }
    if (environmentPRODEV === 'linux') {
        // 获取公网ip
        publicIp.v4().then(
            ip => {
                // -------------------------------------------------
                files.forEach(file => {
                    // 对路径进行处理
                    let path = file.path
                    // windows 本地服务器要用到 '\\'
                    // let pathArr = path.split('\\')
                    // linux/windows 本地服务器要用到 '\/'
                    let pathArr = path.split('\/')

                    pathArr = pathArr.slice(6)
                    // path = 'http://' + ip + ":3000/" + pathArr.join("/")
                    path = `http://${ip}:${environmentPort}/${pathArr.join("/")}`
                    tblj.push(path)

                })
                let condition = {
                    JCBH: tubanId
                }
                let content = {
                    TPLJ: JSON.stringify(tblj)
                }
                // 先获取原来的图斑路径
                // 直接覆盖掉原来的图斑路径

                tuban.update(workTable, content, condition, function (tag, result) {
                    if (tag) {
                        response.status = tag
                        response.msg = 'upload success'
                        response.data = result
                    }
                    res.send(response)
                })
                //-------------------------------------------------------
            }
        )
    }
});

router.post('/attachment', attachmentUpload.any(), function (req, res, next) {

    // 附件已经正确上传至指定文件夹，然后根据请求的数据将路径信息写入数据库。
    let files = req.files
    let {tubanId, tableName} = JSON.parse(req.body.info)
    let workTable = tableName
    // 构造condition
    let fjlj = []
    // todo 对filepath进行拼接，拼接成静态资源服务器的地址
    // todo [ipAdress]:[port] // 市之后的

    if (environmentPRODEV === 'linux') {
        // 获取公网ip
        publicIp.v4().then(
            ip => {
                // -------------------------------------------------
                files.forEach(file => {
                    let path = file.path
                    // windows 本地服务器要用到 '\\'
                    // let pathArr = path.split('\\')
                    // linux/windows 本地服务器要用到 '\/'
                    let pathArr = path.split('\/')

                    pathArr = pathArr.slice(6)
                    path = `http://${ip}:${environmentPort}/${pathArr.join("/")}`
                    // path = 'http://' + ip + ":3000/" + pathArr.join("/")
                    fjlj.push(path)
                })
                let condition = {
                    JCBH: tubanId
                }
                let content = {
                    FJLJ: JSON.stringify(fjlj)
                }
                // 先获取原来的附件路径
                // 直接覆盖掉原来的附件路径

                tuban.update(workTable, content, condition, function (tag, result) {
                    if (tag) {
                        response.status = tag
                        response.msg = 'upload success'
                        response.data = result
                    }
                    res.send(response)
                })

                // -------------------------------------------------

            })
    }
    if (environmentPRODEV === 'windows') {
        files.forEach(file => {
            let path = file.path
            // windows 本地服务器要用到 '\\'
            let pathArr = path.split('\\')
            // linux/windows 本地服务器要用到 '\/'
            // let pathArr = path.split('\/')
            // windows截取到5，linux截取到6
            pathArr = pathArr.slice(5)
            // path = 'http://' + ip.address() + `:${environmentPort}/` + pathArr.join("/")
            path = `http://${ip.address()}:${environmentPort}/${pathArr.join("/")}`
            fjlj.push(path)
        })
        let condition = {
            JCBH: tubanId
        }
        let content = {
            FJLJ: JSON.stringify(fjlj)
        }
        // 先获取原来的附件路径
        // 直接覆盖掉原来的附件路径

        tuban.update(workTable, content, condition, function (tag, result) {
            if (tag) {
                response.status = tag
                response.msg = 'upload success'
                response.data = result
            }
            res.send(response)
        })
    }
});
// todo get请求，获取当前数据库表中的shape数据(指定字段)
router.get('/download', function (req, res, next) {

})

module.exports = router
