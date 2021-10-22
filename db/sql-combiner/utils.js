/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/14
 */
/**
 * 简单where语句组合，支持like = ,and的组合
 * or的话可以将condition调整为condition数组对象
 * @param condition
 * @param isTubanSearch 只有图斑搜索时才会用到这个
 * @param isSplit 当为true时JCBH为必填
 * @param JCBH
 * @returns {string}
 */
const where = function (condition, isTubanSearch, isSplit = false, JCBH) {
    let sql1 = ` where`
    // 先判断是不是存不存在或者是不是空对象,还要判断查询的是不是图斑的表格
    if (!condition || JSON.stringify(condition) === "{}") {
        if(!isTubanSearch) {
            return ' '
        } else {
            return isSplit ? ` where JCBH like '${JCBH}-%' ` : ` where JCBH not like '%-%'`
        }
    }
    for (let key in condition) {
        // condition[key]可能是Number/字符串类型/数组类型
        // 有百分号%，都给他序列化为字符串

        // 如果是数组类型
        if (Object.prototype.toString.call(condition[key]) === "[object Array]") {

            let temp = JSON.stringify(condition[key])
            temp = temp.replace('[', '(').replace(']', ')')
            // console.log(temp)

            sql1 += ` ${key} in ${temp} and`
        } else {
            if (String(condition[key]).indexOf('%') !== -1) {
                sql1 += ` ${key} like ${JSON.stringify(condition[key])} and`
            } else {
                sql1 += ` ${key} = ${JSON.stringify(condition[key])} and`
            }
        }

    }
    sql1 = sql1.slice(0, sql1.length - 3)
    if(!isTubanSearch) {
        return sql1
    } else {
        return isSplit ? sql1 + ` and JCBH like '${JCBH}-%' ` : sql1 + ` and JCBH not like '%-%'`
    }
}

const groupBy = function (name) {
    if (!name || !name.trim()) {
        return ""
    } else return ` group by ${name}`
}

const from = function (tableName) {
    if (!tableName || !tableName.trim()) {
        return ""
    } else return ` from ${tableName}`
}


module.exports = {
    where,
    groupBy,
    from
}


