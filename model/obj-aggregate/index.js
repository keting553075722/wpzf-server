/**
 * 将对象数字按属性聚合起来，前两个覆盖，后面的相加
 * @param objs
 * @returns {*}
 */
const aggregateObjs = (objs) => {
    let keys = Object.keys(objs[0])
    let acc = objs.reduce((acc, cur, idx) => {
        for (let i = 0; i < keys.length; i++) {
            if (i < 2)
                acc[keys[i]] = cur[keys[i]] ? cur[keys[i]] : cur[keys[i]]
            else {
                if (!acc[keys[i]]) acc[keys[i]] = Number(cur[keys[i]])
                else acc[keys[i]] += Number(cur[keys[i]])
            }
        }
        return acc
    }, {})
    return acc
}

/**
 * 对结果进行按照市级分组统计
 * @param objs
 * @returns {[]}
 */
const objsByCityGroup = (objs, cityCode = 'CDM') => {
    let keys = Object.keys(objs[0])
    let acc = []
    let map = {}
    let i = 0  // 记录当前item在acc中的位置
    objs.forEach((item, index, arr) => {
        if (map[item[cityCode]] === undefined) {
            map[item[cityCode]] = i
            acc[i] = item
            i++
        } else {
            let accIndex = map[item[cityCode]]
            for (let j = 2; j < keys.length; j++) {
                acc[accIndex][keys[j]] += item[keys[j]]
            }
        }
    })
    return acc
}

/**
 * 对结果进行县级分组统计
 * @param objs
 * @param countyCode
 * @returns {[]}
 */
const objsByCountyGroup = (objs, countyCode = 'XDM') => {
    let keys = Object.keys(objs[0])
    let acc = []
    let map = {}
    let i = 0  // 记录当前item在acc中的位置
    objs.forEach((item, index, arr) => {
        if (map[item[countyCode]] === undefined) {
            map[item[countyCode]] = i
            acc[i] = item
            i++
        } else {
            let accIndex = map[item[countyCode]]
            for (let j = 2; j < keys.length; j++) {
                acc[accIndex][keys[j]] += item[keys[j]]
            }
        }
    })
    return acc
}

module.exports = {aggregateObjs, objsByCityGroup, objsByCountyGroup}
