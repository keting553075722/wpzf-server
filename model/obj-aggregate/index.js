/**
 * 将对象数字按属性聚合起来，前两个覆盖，后面的相加
 * @param objs
 * @returns {*}
 */
const aggregateObjs = (objs) => {
    let keys = Object.keys(objs[0])
    let acc = result.reduce((acc, cur, idx) => {
        for (let i = 0; i < keys.length; i++) {
            if (i < 2)
                acc[keys[i]] = cur[keys[i]]
            else {
                if (!acc[keys[i]]) acc[keys[i]] = Number(cur[keys[i]])
                else acc[keys[i]] += Number(cur[keys[i]])
            }
        }
        return acc
    }, {})
    return acc
}

module.exports = aggregateObjs
