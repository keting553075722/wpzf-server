/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/7
 */

const flatCity = require("../common-data/flat-city.json")

module.exports = function (code) {
    code = code + ""
    if (!/\d{6}/.test(code)) {
        throw new Error("code格式不正确")
    }
    // 拆解code
    let provinceID = code.substring(0, 2)
    let cityID = code.substring(2, 4)
    let countyID = code.substring(4)
    let provinceCode = provinceID + '0000'
    let cityCode = provinceID + cityID + '00'
    let countyCode = provinceID + cityID + countyID

    // 遍历找到省
    let provinceName  = flatCity[provinceCode] ? flatCity[provinceCode].name : ''
    let cityName  = flatCity[cityCode] ? flatCity[cityCode].name : ''
    let countyName  = flatCity[countyCode] ? flatCity[countyCode].name : ''

    let result = {
        SMC: provinceName,
        CMC: cityName,
        XMC: countyName
    }

    if(cityID == '00' && countyCode == '00') {
        result.CMC = ''
        result.XMC = ''
    } else if(cityID !== '00' && countyCode == '00') {
        result.XMC = ''
    }

    return  result
}
