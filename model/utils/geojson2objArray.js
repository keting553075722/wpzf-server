/**
 * @Description:
 * @author zzh
 * @createTime 2021/3/31
 */
const {isObject, isNull, isDate} = require('../../model/utils/typeCheck')
module.exports = function (geoJSON) {
    if (typeof geoJSON !== "object" || geoJSON === null) {
        throw new Error("数据类型不正确")
    }
    if (!geoJSON.features.length) {
        throw new Error("这是一个空的geoJSON")
    }
    let featureCollection = []
    geoJSON.features.forEach(feature => {
        // 可以在这里做一个匹配，防止出错
        let polygonObj = {}
        let properties = feature.properties
        for (let propertiesKey in properties) {
            if(isNull(properties[propertiesKey])) {
                polygonObj[propertiesKey] = ''
            } else if(isDate(properties[propertiesKey])){
                let cin = JSON.stringify(properties[propertiesKey])
                if(cin = '{}')
                    polygonObj[propertiesKey] = ''
                else
                    polygonObj[propertiesKey] = properties[propertiesKey].toLocaleString()
            } else {
                polygonObj[propertiesKey] = properties[propertiesKey]
            }

        }
        polygonObj["coordinates"] = feature.geometry.coordinates
        featureCollection.push(polygonObj)
    })

    return featureCollection
}
