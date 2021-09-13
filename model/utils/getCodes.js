/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/14
 */

module.exports = function (code) {
    code = code + ""
    if (!(code.length === 6)) {
        throw new Error("code格式不正确")
    }
    // 拆解code
    let provinceCode = code.substring(0, 2)
    let cityCode = code.substring(2, 4)
    let countyCode = code.substring(4)

    return {
        SDM: provinceCode+"0000",
        CDM: provinceCode+cityCode+"00",
        XDM: code
    }
}
