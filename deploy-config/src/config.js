const ip = require('ip')
const publicIp = require('public-ip')
const os = require('os')
const Config = require('../../config.js')

const splitCharMap = function (env) {
    return env == 'linux' ? "\/" : "\\"
}
const ddConfig = Config.ddConfig

const getServerIp = async () => {
    return config.serverEnv == 'windows' ? ip.address() : await publicIp.v4().then(res => res).catch(console.log)
}

const getMac = () => {
    const networkInterfaces = os.networkInterfaces()
    let obj, filterRes
    for (const key in networkInterfaces) {
        filterRes = networkInterfaces[key].filter(itm => itm['family'] == 'IPv4' && itm['address'] != '127.0.0.1' && itm["mac"] !== "00:00:00:00:00:00")
        filterRes.length && (obj = filterRes[0])
    }

    return  obj ? obj['mac'] : "00:00:00:00:00:00"

}

const config = {
    appPort: Config.appPort,
    serverEnv: Config.serverEnv,   // 可选 'linux'  or  'windows'
    activeTableRelativePath: Config.activeTableRelativePath,
    splitChar: splitCharMap(Config.serverEnv),
    serverIp: getServerIp,
    serverMac: getMac(),
    ddConfig: ddConfig,
    taskBatchPattern : /^[a-z0-9A-Z]+\_[0-9]{4}\_[0-9]+/,
    staticReqPattern : /^\/evidence.*\.[\w]+$/  //静态资源路径请求匹配
}

module.exports = config
