/**
 * @Description:
 * @author zzh
 * @createTime 2021/6/9
 */

const moment = require('moment')
module.exports = function (user) {
    /**
     * 返回code的like字符串
     * @param {string} code
     * @returns {string|*}
     */
    const getCode = (code) => {
        if (code.length !== 6) throw new Error('inValid  code')
        if (code.substring(2) === '0000') return code.substring(0, 2) + '%'
        else if (code.substring(4) === '00') return code.substring(0, 4) + '%'
        else return code
    }
    let {code, name, permission} = user
    let _code = getCode(code)
    let dispatchField = permission === "province" ? "SJXF" : "CJXF"
    let supDispatchField = permission === "city" ? "SJXF" : "CJXF"
    let dispatchPersonField = permission === "province" ? "SJXFR" : "CJXFR"
    let dispatchTimeField = permission === "province" ? "SJXFSJ" : "CJXFSJ"
    let reportTimeField = permission === "province" ? "CJJZSJ" : "XJJZSJ"
    let checkField = permission === "province" ? "SJSH" : "CJSH"
    let supCheckField = permission === "city" ? "SJSH" : "CJSH"
    let passField = permission === "province" ? "SJTG" : "CJTG"
    let supPassField = permission === "city" ? "SJTG" : "CJTG"
    let rebackField = permission === "province" ? "SJTH" : "CJTH"
    let supRebackField = permission === "city" ? "SJTH" : "CJTH"
    let reportField = permission === 'city' ? 'CJSB' : 'XJSB'
    let subReportField = permission === 'province' ? 'CJSB' : 'XJSB'

    /**
     * 获得下发图版的条件和要更新的内容
     * @param {array} JCBHs 下发的图斑编号,来自前端参数
     * @param {string} JZSJ 下发时设置上报的截止时间
     * @returns {condition: {}, content: {}}
     */
    const dispatch = (JCBHs, JZSJ) => {
        let condition = {}
        condition['XZQDM'] = _code
        condition['JCBH'] = JCBHs
        permission === 'city' && (condition[supDispatchField] = '1')

        let content = {}
        content[dispatchField] = '1'
        content[dispatchPersonField] = name
        content[dispatchTimeField] = moment().format("YYYY-MM-DD HH:mm:ss")
        content[reportTimeField] = JZSJ

        return {condition, content}
    }

    /**
     * 将下级单位中  本级已经审核但是不通过的图斑 本级退回标记为1,下级上报标记为0
     * @param subCode
     * @returns {{condition: {}, content: {}}}
     */
    const reback = (subCode) => {
        let condition = {}
        condition['XZQDM'] = getCode(subCode)
        condition[checkField] = '1'
        condition[passField] = '0'

        let content = {}
        content[rebackField] = '1'
        content[subReportField] = '0'

        return {condition, content}
    }


    const getReback = () => {
        let condition = {}
        // 上级下发的图斑中
        condition['XZQDM'] = _code
        condition[supDispatchField] = '1' // 上级下发的归属我的
        condition[supCheckField] = '1'
        condition[supRebackField] = '1'  // 上级审核的但退回了
        return condition
    }


    return {
        dispatch,reback
    }
}
