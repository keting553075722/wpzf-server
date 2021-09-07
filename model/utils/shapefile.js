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
module.exports = function (url,callback) {
    shp.read(url).then(function (data) {
        callback(true,toJSONArray(data))
    }).catch(error=>{
        callback(false)
    })
}
