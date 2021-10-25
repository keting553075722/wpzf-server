/**
 * @Author : zzhe
 * @Date : 2021/10/22 15:34
 * @Description : getUrl
 */

module.exports = function (method, originUrl) {
    let url = ''
    method = method.toLowerCase()

    if(method == 'post') {
        url = originUrl
    }

    if(method == 'get') {
        url = originUrl.split('?')[0]
    }

    return url
}