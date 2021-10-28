/**
 * @name: filterDirtyFields
 * @author: zzhe
 * @date: 2021/10/28 16:48
 * @description: filterDirtyFields
 * @update: 2021/10/28 16:48
 */

module.exports = function (objs, schema) {
    if(!objs.length) return []
    let objKeys  = Object.keys(objs[0])
    let dirtyFileds = []
    objKeys.forEach(key => {
        !schema.includes(key) && dirtyFileds.push(key)
    })

    if(!dirtyFileds.length) return objs

    for (let i = 0; i < objs.length; i++) {
        let obj = objs[i]
        for (let j = 0; j < dirtyFileds.length; j++) {
            let dirtyFiled = dirtyFileds[j]
            delete obj[dirtyFiled]
        }
    }

    return objs

}