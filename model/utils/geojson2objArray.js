/**
 * @Description:
 * @author zzh
 * @createTime 2021/3/31
 */

module.exports = function (geoJSON) {
    if (typeof geoJSON !== "object" || geoJSON === null) {
        throw new Error("数据类型不正确")
    }
    if (!geoJSON.features.length) {
        throw new Error("这是一个空的geoJSON")
    }
    let featureCollection = []
    geoJSON.features.forEach(feature => {
        let polygonObj = feature.properties
        polygonObj["coordinates"] = feature.geometry.coordinates
        featureCollection.push(polygonObj)
    })

    return featureCollection
}
