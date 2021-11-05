/**
 * @name: handleDistrict
 * @author: zzhe
 * @date: 2021/11/5 15:13
 * @description: handleDistrict
 * @update: 2021/11/5 15:13
 */
const cityCascade = require('../common-data/city-cascade.json')
/**
 * 处理行政区划条件,这里userType只能为0或1
 * @param {array} district
 * @param {string} code
 * @returns {string}
 */
module.exports = function (district, code) {
  let codeLike = '33'
  let userType = code.substring(2, 6) === '0000' ? 0 : code.substring(4, 6) === '00' ? 1 : 2
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