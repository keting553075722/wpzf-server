/**
 * @name: index
 * @author: zzhe
 * @date: 2021/11/3 9:24
 * @description: index
 * @update: 2021/11/3 9:24
 */

const moment =  require('moment')
module.exports = function () {
  return moment().format("YYYY-MM-DD HH:mm:ss")
}