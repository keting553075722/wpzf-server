/**
 * @Description: 维护一个statusObj,仅在系统启动的时候挂载到global上，在内存中构建状态表
 * @Description:report city county update self
 * @Description:check/tuhui update child
 * @author zzh
 * @createTime 2021/5/27
 */

const statusSchema = require('./data/status-list');
const fs = require('fs');
const Tuban = require('../../db/entities/tuban');
const _ = require('lodash');

/**
 *  @description 程序启动时执行，初始化workTable的状态并将其全部挂载到$statusObj
 */
const init = () => {
    $workTables.length && $workTables.forEach((tableName) => {
        initTableStatus(tableName)
    })
};

/**
 * @description 初始化指定table的status状态并将其挂载到$statusObj
 * @param tableName
 */
const initTableStatus = (tableName) => {
    Tuban.find(tableName,
        {}).then(
        res => {
            let values = res.results

            // 深拷贝一下
            let tempStatus = _.cloneDeep(statusSchema)
            const result = values
            for (let i = 0; i < tempStatus.length; i++) {
                if (tempStatus[i]['TYPE'] === '0') {

                }
                if (tempStatus[i]['TYPE'] === '1') {

                    values = result.filter(itm => {
                        let a = itm['XZQDM'].substring(0, 4)
                        let b = tempStatus[i]['CODE'].substring(0, 4)
                        return a === b
                    })
                    if (values.some(itm => itm['SJXF'] === '1')) {
                        tempStatus[i]['XF'] = '1'
                    } else {
                        continue
                    }

                    values = result.filter(itm => itm['SJXF'] === "1")
                    if (values.length && values.every(itm => itm['CJSB'] === '1')) {
                        tempStatus[i]['SB'] = '1'
                    } else {
                        continue
                    }
                    // 待审核
                    // 状态 {SH: "0", TH: "", TG: ''}
                    if (values.length && values.every(itm => itm['SJSH'] === '0')) {
                        tempStatus[i]['SH'] = '0'
                    }
                    // 审核中
                    // 状态 {SJSH: "1", SJTH: "", SJTG: ''}
                    if (values.length && values.some(itm => itm['SJSH'] === '0') && values.some(itm => itm['SJSH'] === '1')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = ''
                    }

                    // 审核通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '1'}
                    if (values.length && values.every(itm => itm['SJTG'] === '1')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = '1'
                    }
                    // 审核未通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '0'}
                    if (values.length && values.every(itm => itm['SJSH'] === '1') && values.some(itm => itm['SJTG'] === '0')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = '0'
                    }

                    // 退回
                    // 状态 {SJSH: "1", SJTH: "1", SJTG: ''}
                    // 下发的所有图斑都已审核，并且含有退回
                    if (values.length && values.every(itm => itm['SJSH'] === '1') && values.some(itm => itm['SJTH'] === '1')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = '1'
                        tempStatus[i]['TG'] = ''
                    }

                }
                if (tempStatus[i]['TYPE'] === '2') {
                    values = result.filter(itm => itm['XZQDM'] === tempStatus[i]['CODE'])
                    if (values.some(itm => itm['CJXF'] === '1')) {
                        tempStatus[i]['XF'] = '1'
                    } else {
                        continue
                    }

                    values = result.filter(itm => itm['CJXF'] === "1")
                    // 全都上报
                    if (values.length && values.every(itm => itm['XJSB'] === '1')) {
                        tempStatus[i]['SB'] = '1'
                    } else {
                        continue
                    }
                    // 待审核
                    // 状态 {SH: "0", TH: "", TG: ''}
                    if (values.length && values.every(itm => itm['CJSH'] === '0')) {
                        tempStatus[i]['SH'] = '0'
                    }
                    // 审核中
                    // 状态 {SJSH: "1", SJTH: "", SJTG: ''}
                    if (values.length && values.some(itm => itm['CJSH'] === '0') && values.some(itm => itm['CJSH'] === '1')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = ''
                    }

                    // 审核通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '1'}
                    if (values.length && values.every(itm => itm['CJTG'] === '1')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = '1'
                    }
                    // 审核未通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '0'}
                    if (values.length && values.every(itm => itm['CJSH'] === '1') && values.some(itm => itm['CJTG'] === '0')) {
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = ''
                        tempStatus[i]['TG'] = '0'
                    }

                    // 退回
                    // 状态 {SJSH: "1", SJTH: "1", SJTG: ''}
                    // 下发的所有图斑都已审核，并且含有退回
                    if (values.length && values.every(itm => itm['CJSH'] === '1') && values.some(itm => itm['CJTH'] === '1')) {
                        // console.log(tempStatus[i])
                        tempStatus[i]['SH'] = '1'
                        tempStatus[i]['TH'] = '1'
                        tempStatus[i]['TG'] = ''
                    }
                }
            }
            values = result
            global.$statusObj[tableName] = tempStatus.filter(x => x['XF'] === '1')
        }
    )
};

/**
 * @description 省市审核，省级审核只需要更新市级的状态，市级审核只需要更新县级的状态
 * @description 省级审核 需要更新市级的状态
 * @description 市级审核只需要更新县级的状态
 * @description 审核只会审核已经下发的，并且只会做出通过和不通过的动作
 * @description 下发和审核的动作中调用该监听方法
 * @param tableName
 * @param code 0|1 审核人的类型
 * @param type
 */
const check = (tableName, code, permission) => {
    let type = permission === "province" ? '1' : '2'
    let subLen = permission === "province" ? 4 : 6
    let XFField = permission === "province" ? 'SJXF' : 'CJXF'
    let SHField = permission === "province" ? 'SJSH' : 'CJSH'
    let TGFField = permission === "province" ? 'SJTG' : 'CJTG'
    let THField = permission === "province" ? 'SJTH' : 'CJTH'

    // 取出table批次的所有的记录
    // 如果是省级审核，就遍历所有的市
    // 如果是市级审核，就遍历该市所属的所有的县
    Tuban.find(tableName, {}).then(
        (res) => {
            let results = res.results

            let status = global.$statusObj[tableName]
            let len = status.length
            for (let i = 0; i < len; i++) {
                let itm = status[i]

                // 审核走的逻辑
                if (itm['TYPE'] === type) {
                    // 该批次中该市所属的所有省级下发的图斑
                    let itmOwnsXF = results.filter(tuban => tuban['XZQDM'].substring(0, subLen) === itm['CODE'].substring(0, subLen) && tuban[XFField] === '1')

                    // 待审核,上级下发的一个都没有审核
                    // 状态 {SH: "0", TH: "", TG: ''}
                    if (itmOwnsXF.length && itmOwnsXF.every(itm => itm[SHField] === '0')) {
                        itm['SH'] = '0'
                        itm['TH'] = ''
                        itm['TG'] = ''
                        continue
                    }
                    // 审核中
                    // 状态 {SJSH: "1", SJTH: "", SJTG: ''}
                    if (itmOwnsXF.length && itmOwnsXF.some(itm => itm[SHField] === '0') && itmOwnsXF.some(itm => itm[SHField] === '1')) {
                        itm['SH'] = '1'
                        itm['TH'] = ''
                        itm['TG'] = ''
                        continue
                    }
                    // 审核通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '1'}
                    if (itmOwnsXF.length && itmOwnsXF.every(itm => itm[TGFField] === '1')) {
                        itm['SH'] = '1'
                        itm['TH'] = ''
                        itm['TG'] = '1'
                        continue
                    }
                    // 审核未通过
                    // 状态 {SJSH: "1", SJTH: "", SJTG: '0'}
                    if (itmOwnsXF.length && itmOwnsXF.every(itm => itm[SHField] === '1') && itmOwnsXF.some(itm => itm[TGFField] === '0')) {
                        itm['SH'] = '1'
                        itm['TH'] = ''
                        itm['TG'] = '0'
                        continue
                    }

                    // 退回状态需要手动标注
                    // 状态 {SJSH: "1", SJTH: "1", SJTG: ''}
                    // 下发的所有图斑都已审核，并且含有退回
                    // if (itmOwnsXF.length && itmOwnsXF.every(itm => itm[SHField] === '1') && itmOwnsXF.some(itm => itm[THField] === '1')) {
                    //     global.$statusObj[tableName][i]['SH'] = '1'
                    //     global.$statusObj[tableName][i]['TH'] = '1'
                    //     global.$statusObj[tableName][i]['TG'] = ''
                    // }
                }
            }
        }).catch(console.log)
};

/**
 * @description 市级和县级上报，更新自身
 * @description 未上报才会上报
 * @description 已经上报的不做反应
 * @param tableName
 * @param code
 */
const report = (tableName, code) => {
    let status = global.$statusObj[tableName]
    let len = status.length
    for (let i = 0; i < len; i++) {
        let itm = status[i]
        if (itm['CODE'] === code) {
            if (itm['SB'] = '1') {
                console.log(`${code}重复上报`);
                return
            } else {
                itm['SB'] = '1'
                itm['SH'] = ''
                itm['TH'] = ''
                itm['TG'] = ''
                console.log(`${code}上报`);
            }
        }
    }
};

/**
 * @description 市级和省级退回，更新下一级的状态 // todo
 * @description 审核完毕，并且有不通过的图斑,执行退回操作
 * @description 执行退回操作，将下一级中含有不通过图斑的标记为退回，并且重置其上报状态
 * @param tableName
 * @param code 要退回的单位的code
 * @param type 1是市级 2是县级
 */
const reback = (tableName, code, type) => {
    let XFField = type === "1" ? 'SJXF' : 'CJXF'
    let SHField = type === "1" ? 'SJSH' : 'CJSH'
    let TGFField = type === "1" ? 'SJTG' : 'CJTG'

    global.$statusObj[tableName].forEach((itm, index) => {
        if (itm['CODE'] === code) {
            global.$statusObj[tableName][index]['TH'] = '1'
            global.$statusObj[tableName][index]['SB'] = '0'
            global.$statusObj[tableName][index]['TG'] = ''
            global.$statusObj[tableName][index]['SH'] = '1'
        }
    })
};

/**
 * @description  下发图版,本身没有不在状态列表中，下发后就在状态列表,根据权限和下发的图斑编号找到该对象添加进去
 * @param {*} tableName
 * @param {*} code
 */
const giveNotice = (tableName, permission, JCBHs) => {
    let subLen = permission === "province" ? 4 : 6
    // 下发涉及到的所有单位
    let codes = [...new Set(JCBHs.map(x => x.substring(0, subLen)))]
    if (subLen === 4) {
        codes = codes.map(x => x + '00')
    }

    codes.forEach((code, idx, arr) => {
        let obj = global.$statusObj[tableName].find(x => x.CODE === code)
        if (obj) {
            obj['XF'] = 1
        } else {
            let statusObj = statusSchema.filter(x => x.CODE === code)[0]
            statusObj['XF'] = 1
            global.$statusObj[tableName].push(statusObj)
        }
    })
};

/**
 * @description add tableName 进入观测状态
 * @param tableName
 */
const statusAdd = (tableName) => {
    if (!global.$workTables.includes(tableName)) {
        global.$workTables.pushItem(tableName);
        initTableStatus(tableName); // 添加挂载
        console.log(`${tableName}不存在workTables,新增挂载到statusObj`);
    } else {
        initTableStatus(tableName); // 已经存在的更新
        console.log(`${tableName}已存在workTables,更新statusObj[${tableName}]`);
    }
};

/**
 * @description delete tableName 删除tableName
 * @param tableName
 */
const statusDel = (tableName) => {
    if (!global.$workTables.includes(tableName)) {
        console.log(`statusObj[${tableName}]不存在,无需删除`);
    } else {
        global.$workTables.removeItem(tableName);
        delete global.$statusObj[tableName];
        console.log(`statusObj[${tableName}]删除成功`);
    }
};

module.exports = {
    init, check, reback, report, giveNotice, statusAdd, statusDel
}




