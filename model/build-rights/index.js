/**
 * @Description:
 * @author zzh
 * @createTime 2021/5/27
 */
const {cloneDeep} = require('lodash')
const cityCascade = require('../common-data/city-cascade')
const {province, city, county} = require('./lib/rights')
const Task = require('../../db/entities/task')
const provinceRights = ['fileUpload', 'giveNotice', 'refresh', 'cascadeSearch', 'look']
const cityRights = ['giveNotice', 'refresh', 'cascadeSearch', 'look']
const countyRights = ['refresh', 'look', 'check']
const cascader = cityCascade[0].children

const templateItem = (Id, Name, idx) => {
    return {
        id: 999,
        authName: `${Name}`,
        icon: "el-icon-menu",
        path: `/main/${Id}`,
        tag: `${Id}`,
        cascade: [],
        rights: [],
        children: [],
    }
}

const userManage = () => {
    return {
        id: 1999,
        authName: `访客管理`,
        icon: "el-icon-user",
        path: `/main/userManage`,
        tag: `userManage`,
        cascade: [],
        rights: [],
        children: [],
    }
}


const getMenu = async (code) => {
    let addMenus = []
    let findRes = await Task.find(['Id', 'Name']).then(res => res).catch(console.log)
    if (findRes && findRes.results && findRes.results.length) {
        for (let result of findRes.results) {
            let temMenu = templateItem(result.Id, result.Name)
            temMenu['cascade'] = getCascade(code)
            temMenu['rights'] = getRight(code)
            addMenus.push(temMenu)
        }
    }
    return addMenus
}

const getCascade = (code) => {
    if (code.substring(2, 6) === '0000') {
        return cityCascade[0].children
    } else if (code.substring(4, 6) === '00') {
        return cityCascade[0].children.find(x => x.code === code.substring(2, 4)).children
    } else {
        return []
    }
}

const getRight = (code) => {
    if (code.substring(2, 6) === '0000') {
        return ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDown', 'view', 'details-reback']
    } else if (code.substring(4, 6) === '00') {
        return ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'sendDown', 'view']
    } else {
        return ['batch', 'evidence', 'codeKey', 'refresh', 'view', 'evidence']
    }
}

const getBasicMenu = () => {
    const provinceBasic = cloneDeep(province)
    const cityBasic = cloneDeep(city)
    const countyBasic = cloneDeep(county)
    return {provinceBasic, cityBasic, countyBasic}
}

const build = async (code, auth = '') => {
    // 重置菜单
    const {provinceBasic, cityBasic, countyBasic} = getBasicMenu()
    cityBasic[0]['cascade'] = getCascade(code)
    let addMenus = await getMenu(code)
    if (code.substring(2, 6) === '0000') {
        provinceBasic[0].children.splice(3, 0, ...addMenus)
        if(auth == 'super_sa') {
            provinceBasic.push(userManage())
        }
        return provinceBasic
    } else if (code.substring(4, 6) === '00') {
        cityBasic.splice(1, 0, ...addMenus)
        return cityBasic
    } else {
        countyBasic.splice(1, 0, ...addMenus)
        return countyBasic
    }
}


module.exports = build






