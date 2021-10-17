/**
 * @Author : zzhe
 * @Date : 2021/10/17 16:29
 * @Description : 判断类型
 */

const typeMap = {
    'Number': "[object Number]",
    'String': "[object String]",
    'Symbol': "[object Symbol]",
    'BigInt': "[object BigInt]",
    'Null': "[object Null]",
    'Undefined': "[object Undefined]",
    'Boolean': "[object Boolean]",
    'Array': "[object Array]",
    'Object': "[object Object]",
    'Date': "[object Date]",
}

const check = (target) => {
    return Object.prototype.toString.call(target)
}

module.exports = {
    isNumber(target) {
        return check(target) == typeMap['Number']
    },
    isString(target) {
        return check(target) == typeMap['String']
    },
    isSymbol(target) {
        return check(target) == typeMap['Symbol']
    },
    isBigInt(target) {
        return check(target) == typeMap['BigInt']
    },
    isNull(target) {
        return check(target) == typeMap['Null']
    },
    isUndefined(target) {
        return check(target) == typeMap['Undefined']
    },
    isBoolean(target) {
        return check(target) == typeMap['Boolean']
    },
    isArray(target) {
        return check(target) == typeMap['Array']
    },
    isObject(target) {
        return check(target) == typeMap['Object']
    },
    isDate(target) {
        return check(target) == typeMap['Date']
    }
}