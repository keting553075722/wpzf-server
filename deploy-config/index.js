const ip = require('ip')
const publicIp = require('public-ip')
const os = require('os')

const splitCharMap = {
    windows: '\\',
    linux: '\/'
}

const ddConfig = {
    appid: 'wpzf_dingoa',
    appkey: 'wpzf_dingoa-JFyyCo81V2EYyEVN3m',
    appsecret: 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg',
    requesturl: 'http://localhost:8083/'
}

const getServerIp = async () => {
    return this.serverEnv == 'windows' ? ip.address() : await publicIp.v4().then(res => res).catch(console.log)
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

module.exports = {
    appPort: '3000',
    serverEnv: 'windows',   // 可选 'linux'  or  'windows'
    activeTableRelativePath: '/work-tables.propertries',
    splitChar: splitCharMap[this.serverEnv],
    serverIp: getServerIp,
    serverMac: getMac(),
    ddConfig: ddConfig
}
