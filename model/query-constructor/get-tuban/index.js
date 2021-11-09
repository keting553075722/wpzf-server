/**
 * @description: query-construct construct condition
 * @author zzh
 * @createTime 2021/6/4
 */
const cityCascade = require('../../common-data/city-cascade')
// kind,dispatch,district,check,report,evidence
const queryBuild = (body, code) => {
    let userType = code.substring(2, 6) === "0000" ? 0 : code.substring(4, 6) === "00" ? 1 : 2
    let queryObj = {}
    const {kind, dispatch, district, check, report, evidence, town} = body
    if (userType === 0) {
        //kind 字段缺省或者 '' 0 1 2
        kind && (queryObj['TBLY'] = kind)
        //dispatch 字段缺省或者 '' 0 1
        dispatch && (queryObj['SJXF'] = dispatch)
        if (district) district.toString() && (queryObj['XZQDM'] = handleDistrict(district, code))
        check && (queryObj['SJSH'] = check)
    } else if (userType === 1) {
        queryObj["XZQDM"] = code.substring(0, 4) + "%"
        queryObj["SJXF"] = '1'
        //kind 字段缺省或者 '' 0 1 2
        kind && (queryObj['TBLY'] = kind)
        //dispatch 字段缺省或者 '' 0 1
        dispatch && (queryObj['CJXF'] = dispatch)
        if (district) district.toString() && (queryObj['XZQDM'] = handleDistrict(district, code))
        check && (queryObj['CJSH'] = check)
        report && (queryObj['CJSB'] = report)
    } else {
        queryObj["XZQDM"] = code
        queryObj["SJXF"] = '1'
        queryObj["CJXF"] = '1'
        //kind 字段缺省或者 '' 0 1 2
        kind && (queryObj['TBLY'] = kind)
        //dispatch 字段缺省或者 '' 0 1
        dispatch && (queryObj['CJXF'] = dispatch)
        if (district) district.toString() && (queryObj['XZQDM'] = handleDistrict(district, code))
        check && (queryObj['CJSH'] = check)
        report && (queryObj['CJSB'] = report)//kind 字段缺省或者 '' 0 1 2
        evidence && (queryObj['XJJZ'] = evidence)
        town && (queryObj['SSXZ'] = town)
    }
    return queryObj
}

/**
 * 处理行政区划条件,这里userType只能为0或1
 * @param {array} district
 * @param {string} code
 * @returns {string}
 */
const handleDistrict = (district, code) => {
    let codeLike = '33'
    let userType = code.substring(2, 6) === "0000" ? 0 : code.substring(4, 6) === "00" ? 1 : 2
    if (userType === 2) return code
    let options
    if (userType === 0) {
        options = cityCascade[0].children
        if (district.length === 1) {
            codeLike += options.find(x => x.name === district[0]).code
            codeLike += '%'
        } else {
            options = options.find((x => x.name === district[0]))
            codeLike += options.code
            codeLike += options.children.find((x => x.name === district[1])).code
        }
    } else {
        options = cityCascade[0].children.find(x => code.substring(2, 4) === x.code).children
        codeLike = code.substring(0, 4)
        codeLike += options.find(x => x.name === district[0]).code
    }
    return codeLike
}

module.exports = queryBuild
