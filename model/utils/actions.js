const moment = require('moment')
const handleDistrict = require('./handleDistrict')
const {role} = require('../../db/properties/permission-mapper')
module.exports = {
    /**
     * 获得下发图版的条件和要更新的内容
     * @param {object} user 用户信息
     * @param {array} tubans 下发的图斑
     * @param {string} tubans 上报的截止时间
     * @param {string} type 下发类型
     * @returns 返回下发的条件和内容
     */
    dispatch(user, JCBHs, JZSJ, district, dispatch) {
        // 省级才能下发
        let code = user.code
        let dispatchField = user.permission === "province" ? "SJXF" : "CJXF"
        let dispatchPersonField = user.permission === "province" ? "SJXFR" : "CJXFR"
        let dispatchTimeField = user.permission === "province" ? "SJXFSJ" : "CJXFSJ"
        let reportTimeField = user.permission === "province" ? "CJJZSJ" : "XJJZSJ"
        let codeLike
        if(user.permission == role['city'] && !user['type']) {
            codeLike = code.substring(0,4) + '%'
        } else {
            codeLike = '33%'
        }
        // let codeLike = user.permission = role['province'] ? code.substring(0,2) + '%' : user['type'] ? '33%' : code.substring(0,4) + '%'

        let content = {}
        content[dispatchField] = "1"
        content[dispatchPersonField] = user.name
        content[dispatchTimeField] = moment().format("YYYY-MM-DD HH:mm:ss")
        content[reportTimeField] = JZSJ

        let condition = {}
        // condition['JCBH'] = codeLike
        if(JCBHs.length) { // 直接通过选定图斑下发
            condition['JCBH'] = JCBHs
        } else {
            if(user.permission = role['province']) {
                //condition['SJXF'] = '1'
            }
            if(user.permission == role['city']) {
                condition['SJXF'] = '1'
            }
        }
        dispatch && (condition[dispatchField] = dispatch)
        if (district) district.toString() && (condition['XZQDM'] = handleDistrict(district, user.code))

        return {content, condition}
    },

    // 上报全部图斑
    /**
     * 获得上报图版的条件和要更新的内容
     * @param {object} user 权限字段
     * @returns 返回上报的条件和内容
     */
    report(user) {
        let reportField = user.permission === "city" ? "CJSB" : "XJSB"
        let reportPersonField = user.permission === "city" ? "CJSBR" : "XJSBR"
        let reportTimeField = user.permission === "city" ? "CJSBSJ" : "XJSBSJ"
        let conditionField = user.permission === "city" ? "CDM" : "XDM"
        let XFField = user.permission === 'city' ? 'SJXF' : 'CJXF'
        let content = {}
        content[reportField] = "1"
        content[reportPersonField] = user.name
        content[reportTimeField] = moment().format("YYYY-MM-DD HH-mm-ss")
        let condition = {}
        condition[XFField] = '1' //上级下发的才上报
        condition[conditionField] = user.code
        return {content, condition}
    },
    /**
     * (批量审核通过)根据权限更新图斑数组的审核字段
     * @param {object} user 用户信息
     * @param {string} SHTG 审核结果，通过或者不通过
     * @param {string} SHYJ 审核意见
     * @param {array} JCBHs 需要审核的图斑监测编号
     * @returns 返回审核字段更新后的图斑数组
     */
    check(user, SHYJ = "", SHTG, JCBHs) {
        // 省级审核状态
        let content = {}
        // 如果是市级审核
        if (user.permission === "city") {
            content["CJSH"] = '1'
            content["CJTG"] = SHTG
            content["CJYJ"] = SHYJ
            content["CJSHR"] = user.name
            content["CJSHSJ"] = moment().format("YYYY-MM-DD HH-mm-ss")
            content["CJTH"] = '0'
        } else {
            content["SJSH"] = '1'
            content["SJTG"] = SHTG
            content["SJYJ"] = SHYJ
            content["SJSHR"] = user.name
            content["SJSHSJ"] = moment().format("YYYY-MM-DD HH-mm-ss")
            content["SJTH"] = '0'
        }

        let condition = {
            JCBH: JCBHs
        }
        return {content, condition}
    },

    /**
     * 县级举证
     * @param {object} user 用户信息
     * @param {string} JZLX 举证结果
     * @param {string} WFLX 违法类型
     * @param {string} WFMJ 违法面积
     * @param {array} JCBHs 需要举证的图斑监测编号
     * @returns 返回审核字段更新后的图斑数组
     */
    evidence(user, JZLX, WFLX, WFMJ = "", BZ = "", JCBHs) {
        // 省级审核状态
        let content = {}
        content["XJJZ"] = '1'
        content["JZLX"] = JZLX
        content["WFLX"] = WFLX
        content["WFMJ"] = WFMJ
        content["BZ"] = BZ
        content["XJJZR"] = user.name
        content["JZWCSJ"] = moment().format("YYYY-MM-DD HH-mm-ss")
        // 不需要外业核查
        content["WYHC"] = '0'
        content["HCSB"] = '0'

        let condition = {
            JCBH: JCBHs
        }
        return {content, condition}
    },
    /**
     * 调转图斑外业核查
     * @param {object} user 用户信息
     * @param {array} JCBHs 需要举证的图斑监测编号
     * @returns {{condition: {JCBH: *}, content: {}}}
     */
    fieldVerification(user, JCBHs) {
        let content = {}
        // 如果是市级审核

        content["XJJZ"] = '0'
        content["WYHC"] = '1'
        content["HCSB"] = '0'
        let condition = {
            JCBH: JCBHs
        }
        return {content, condition}
    },
    /**
     * 县级外业核查举证
     * @param {object} user 用户信息
     * @param {string} JZLX 举证结果
     * @param {string} WFLX 违法类型
     * @param {string} WFMJ 违法面积
     * @param {array} JCBHs 需要举证的图斑监测编号
     * @returns 返回审核字段更新后的图斑数组
     */
    fieldVerificationReport(user, JZLX, WFLX, WFMJ, BZ, JCBHs) {
        let content = {}
        content["XJJZ"] = '1'
        content["JZLX"] = JZLX
        content["WFLX"] = WFLX
        content["WFMJ"] = WFMJ
        content["BZ"] = BZ
        content["XJJZR"] = user.name
        content["JZWCSJ"] = moment().format("YYYY-MM-DD HH-mm-ss")
        // 不需要外业核查
        content["WYHC"] = '1'
        content["HCSB"] = '1'
        let condition = {
            JCBH: JCBHs
        }
        return {content, condition}
    },


    /**
     * 返回退回需要更新的内容和条件
     * @param {user} 执行退回操作的用户
     * @returns 需要更新的内容和条件
     */
    reback(user) {
        let XFField = user.permission === "province" ? "SJXF" : "CJXF"
        let SHField = user.permission === "province" ? "SJSH" : "CJSH"
        let TGField = user.permission === "province" ? "SJTG" : "CJTG"
        let THField = user.permission === "province" ? "SJTH" : "CJTH"
        let SBField = user.permission === "province" ? "CJSB" : "XJSB"
        // 找到审核状态为1并且通过状态为0的图斑,将其退回字段置为1
        let condition = {}
        condition[XFField] = '1'
        condition[SHField] = '1'
        condition[TGField] = '0'
        let content = {}
        content[THField] = "1"
        content[SBField] = "0"
        return {content, condition}
    },
    /**
     * 根据权限调整tuban审核下发上报通过指定的字段
     * @param {array} tubans 图斑数组
     * @param {string} permission 请求user的权限信息
     * @returns tubans中指定字段的数组
     */
    modifyTubanByPermission( tubans ,permission) {
        // 权限字段映射
        let fieldsMap = {
            // 省级视角观察一条图斑
            province: {
                // 季度图斑界面需要
                XF: "SJXF", // 观察下发状态(本级)(上一级下发与否在这里看不到，只能看到已经下发的)
                XFSJ: "SJXFSJ",
                XFR: "SJXFR",

                // 审核界面需要
                SH: "SJSH", // 观察审核状态(已审核/未审核)
                TG: "SJTG", // 观察通过状态
                TH: "SJTH", // 观察退回状态(本级退回)
                supTH: "", // 父级退回
                YJ: "",// 上一级意见

                SHTG:'SJTG',
                SHYJ:'SJYJ',
                // 上报界面需要
                SB: "",// 省级上报
                SBSJ: "",// 省级上报时间
                SBR: "",// 省级上报人
            },
            city: {
                // 季度图斑界面需要
                XF: "CJXF", // 观察下发状态(本级)(上一级下发与否在这里看不到，只能看到已经下发的)
                XFSJ: "CJXFSJ",
                XFR: "CJXFR",

                // 审核界面需要
                SH: "CJSH", // 观察审核状态(已审核/未审核)
                TG: "CJTG", // 观察通过状态
                TH: "CJTH", // 观察退回状态(本级退回)
                supTH: "SJTH", // 父级退回
                YJ: "SJYJ",// 上一级意见
                SHTG:'CJTG',
                SHYJ:'CJYJ',
                // 上报界面需要
                SB: "CJSB",// 市级上报
                SBSJ: "CJSBSJ",// 市级上报时间
                SBR: "CJSBR",// 市级上报人
                // 上报截止时间
                JZSJ: "CJJZSJ"

            },
            county: {
                // 季度图斑界面需要
                // XF: "", // 观察下发状态(本级)(上一级下发与否在这里看不到，只能看到已经下发的)
                // XFSJ: "",
                // XFR: "",

                // 审核界面需要
                SH: "XJJZ", // 观察审核状态(已审核/未审核)
                // TG: "CJTG", // 观察通过状态
                // TH: "CJTH", // 观察退回状态(本级退回)
                supTH: "CJTH", // 父级退回
                YJ: "CJYJ",// 上一级意见

                // 上报界面需要
                SB: "XJSB",// 县级上报
                SBSJ: "XJSBSJ",// 县级上报时间
                SBR: "XJSBR",// 县级上报人
                // 上报截止时间
                JZSJ: "XJJZSJ"
            }
        }
        let fields = fieldsMap[permission]
        tubans.forEach(tuban => {
            let obj = {}
            // 组装obj对象
            Object.keys(fields).forEach(field => {
                obj[field] = tuban[fields[field]]
            })
            // 将obj对象的属性添加到tuban
            Object.assign(tuban, obj)
        })
        return tubans
    },
    /**
     * 获取tubans中指定字段的数组
     * @param {array} tubans 图斑数组
     * @param {string} prop 图斑的某个字段
     * @returns tubans中指定字段的数组
     */
    getAtrributes(tubans, prop) {
        let attrs = []
        tubans.forEach(tuban => {
            attrs.push(tuban[prop])
        });
        return attrs
    },
    /**
     * 将指定图斑数组的指定图斑字段更新为1
     * @param {array} field 更新的字段数组
     * @param {array} tubans 要更新的数组
     * @returns 返回更新后的图斑引用
     */
    update1Tubans(field, value, tubans) {
        for (let i = 0; i < tubans.length; i++) {
            let tuban = tubans[i];
            tuban[field] = value
        }
        return tubans
    }

}
