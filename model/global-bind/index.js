/**
 * @name: index
 * @author: zzhe
 * @date: 2021/11/9 20:24
 * @description: index
 * @update: 2021/11/9 20:24
 */
let GLOBAL = global
const fs = require('fs')
const config = require('../../deploy-config/src/config')
const getCurrentTime = require('../get-current-time')

module.exports = function () {
  // 全局属性
  GLOBAL.$workTablesPath = __dirname + '/../../' + config.activeTableRelativePath;
  GLOBAL.$workTables = JSON.parse(fs.readFileSync($workTablesPath).toString());
  GLOBAL.$statusObj = {}
  GLOBAL.environmentPRODEV = config.serverEnv
  GLOBAL.environmentPort = config.appPort
  GLOBAL.taskBatchPattern = config.taskBatchPattern
  GLOBAL.getCurrentTime = getCurrentTime


// 根据表名获取Id
  GLOBAL.getId = (tableName) => {
    return tableName.split('_')[0]
  }

  GLOBAL.getInfo = (tableName) => {
    const [Id, year, batch] = tableName.split('_')
    return {Id, year, batch}
  }

  Array.prototype['pushItem'] = function (item) {
    if (this.includes(item)) return
    this.push(item)
    let Id = getId(item)
    $workTables[Id] = this
    fs.writeFileSync($workTablesPath, JSON.stringify($workTables))
  }
  Array.prototype['removeItem'] = function (item) {
    if (!this.includes(item)) return
    let index = this.indexOf(item)
    this.splice(index, 1)
    let Id = getId(item)
    $workTables[Id] = this
    fs.writeFileSync($workTablesPath, JSON.stringify($workTables))
  }

  String.prototype.toBytes = function (encoding) {
    let buff = new Buffer(this, encoding)
    return buff
  }



}
