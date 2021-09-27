/**
 * @Description: 解析shape-file
 * @author zzh
 * @createTime 2021/4/7
 */

const shp = require('shapefile')
const toJSONArray = require('./geojson2objArray')

/**
 * 返回一个JSON数组
 * @param url
 * @param callback
 */
module.exports = function (url) {
    return new Promise((resolve, reject) => {
        shp.read(url).then(function (data) {
            resolve(toJSONArray(data))
        }).catch(error=>{
            reject(error)
        })
    })

}
