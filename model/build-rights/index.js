/**
 * @Description:
 * @author zzh
 * @createTime 2021/5/27
 */
const {cloneDeep} = require('lodash')
const cityCascade = require('../common-data/city-cascade')
const {province, city, county} = require('./lib/rights')
const provinceRights = ['fileUpload', 'giveNotice', 'refresh', 'cascadeSearch', 'look']
const cityRights = ['giveNotice', 'refresh', 'cascadeSearch', 'look']
const countyRights = ['refresh', 'look', 'check']
const cascader = cityCascade[0].children

const TBRightItem = {
    id: 111,
    authName: "",
    icon: "el-icon-menu",
    path: "/main/jdtb",
    tag: "jdtb",
    cascade: [],
    rights: [],
    children: [],
}

const build = (code) => {
    if (code.substring(2, 6) === '0000') {
        // todo 可以增加一些额外的逻辑
        return province
    } else if (code.substring(4, 6) === '00') {
        // 市级
        city[0]['cascade'] = cityCascade[0].children.find(x => x.code === code.substring(2, 4)).children
        return city
    } else {
        return county
    }
}


module.exports = build






