/**
 * @Description:建通省所属市/市所属县是否审核完成
 * @author zzh
 * @createTime 2021/4/19
 */

const Tuban = require('../../db/entities/tuban')
const Status = require('../../db/entities/status')
module.exports = {
    city(tableName, cities, cb) {
        cities.forEach((cityCode) => {
                Tuban.find(tableName, {CDM: cityCode}, function (tag, result) {
                    if (tag) {
                        // 下发的状态
                        // 该市级单位图斑中有数据含有省级下发，该市也为省级下发
                        if (result.some(itm => itm['SJXF'] === '1')) {
                            Status.update({SJXF: "1"}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })
                        } else {
                            // 没有下发，直接返回
                            return
                        }

                        // 所有的省级下发的
                        result = result.filter(itm => itm['SJXF'] === "1")

                        // 上报的状态
                        // 如果下发的数据都上报了,才是上报的状态，否则，就是未上报
                        if (result.length && result.every(itm => itm['CJSB'] === '1')) {
                            Status.update({CJSB: "1"}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })
                        } else {
                            // 没有上报直接返回
                            return;
                            Status.update({CJSB: "0"}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }

                        // 待审核
                        // 状态 {SJSH: "0", SJTH: "", SJTG: ''}
                        // 如果所属图斑中全部是未审核的图斑，呈现待审核状态
                        if (result.length && result.every(itm => itm['SJSH'] === '0')) {
                            Status.update({SJSH: "0", SJTH: "", SJTG: ""}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }
                        // 审核中
                        // 状态 {SJSH: "1", SJTH: "", SJTG: ''}
                        // 如果所属图斑中存在未审核图斑同时存在审核的图斑，呈现审核中状态
                        if (result.length && result.some(itm => itm['SJSH'] === '0') && result.some(itm => itm['SJSH'] === '1')) {
                            Status.update({SJSH: "1", SJTH: "", SJTG: ""}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }

                        // 审核通过
                        // 状态 {SJSH: "1", SJTH: "", SJTG: '1'}
                        // 下发的所有图斑都审核通过
                        if (result.length && result.every(itm => itm['SJTG'] === '1')) {
                            Status.update({SJSH: "1", SJTH: "", SJTG: '1'}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }

                        // 审核未通过
                        // 状态 {SJSH: "1", SJTH: "", SJTG: '0'}
                        // 下发的所有图斑都已审核，并且含有不通过
                        if (result.length && result.every(itm => itm['SJSH'] === '1')  && result.some(itm => itm['SJTG'] === '0')) {
                            Status.update({SJSH: "1", SJTH: "", SJTG: '0'}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }

                        // 退回
                        // 状态 {SJSH: "1", SJTH: "1", SJTG: ''}
                        // 下发的所有图斑都已审核，并且含有退回
                        if (result.length && result.every(itm => itm['SJSH'] === '1') && result.some(itm => itm['SJTH'] === '1')) {
                            Status.update({SJSH: "1", SJTH: "1", SJTG: ''}, {CODE: cityCode}, function (tag, res) {
                                if (tag) cb(true, res, cityCode)
                            })

                        }
                    }
                })
            }
        )
    },
    county(tableName, counties, cb) {
        counties.forEach((countyCode) => {
            Tuban.find(tableName, {XDM: countyCode}, function (tag, result) {
                    if (tag) {
                        // 下发的状态
                        // 该县级单位图斑中有数据含有市级下发，该县也为市级下发
                        if (result.some(itm => itm['CJXF'] === '1')) {
                            Status.update({CJXF: "1"}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })
                        } else {
                            // 没有下发，直接返回
                            return
                        }

                        // 所有的市级下发的，但是要排除空的情况
                        result = result.filter(itm => itm['CJXF'] === "1")

                        // 上报的状态
                        // 如果下发的数据都上报了,才是上报的状态，否则，就是未上报
                        if (result.length && result.every(itm => itm['XJSB'] === '1')) {
                            Status.update({XJSB: "1"}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })
                        } else {
                            // 没有上报直接返回
                            return;
                            Status.update({XJSB: "0"}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }

                        // 待审核
                        // 状态 {CJSH: "0", CJTH: "", CJTG: ''}
                        // 如果所属图斑中全部是未审核的图斑，呈现待审核状态
                        if (result.length && result.every(itm => itm['CJSH'] === '0')) {
                            Status.update({CJSH: "0", CJTH: "", CJTG: ""}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }
                        // 审核中
                        // 状态 {CJSH: "1", CJTH: "", CJTG: ''}
                        // 如果所属图斑中存在未审核图斑，呈现审核中状态
                        if (result.length && result.some(itm => itm['CJSH'] === '0') && result.some(itm => itm['CJSH'] === '1')) {
                            Status.update({CJSH: "1", CJTH: "", CJTG: ""}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }

                        // 审核通过
                        // 状态 {CJSH: "1", CJTH: "", CJTG: '1'}
                        // 下发的所有图斑都审核通过
                        if (result.length && result.every(itm => itm['CJSH'] === '1') && result.every(itm => itm['CJTG'] === '1')) {
                            Status.update({CJSH: "1", CJTH: "", CJTG: '1'}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }

                        // 审核未通过
                        // 状态 {CJSH: "1", CJTH: "", CJTG: '0'}
                        // 下发的所有图斑都已审核，并且含有不通过
                        if (result.length && result.every(itm => itm['CJSH'] === '1') && result.some(itm => itm['CJTG'] === '0')) {
                            Status.update({CJSH: "1", CJTH: "", CJTG: '0'}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }

                        // 退回
                        // 状态 {CJSH: "1", CJTH: "1", CJTG: ''}
                        // 下发的所有图斑都已审核，并且含有退回
                        if (result.length && result.every(itm => itm['CJSH'] === '1') && result.some(itm => itm['CJTH'] === '1')) {
                            Status.update({CJSH: "1", CJTH: "1", CJTG: ''}, {CODE: countyCode}, function (tag, res) {
                                if (tag) cb(true, res, countyCode)
                            })

                        }

                    }
                }
            )
        })
    }
}
