const ip = require('ip')
const publicIp = require('public-ip')

const splitCharMap = {
    windows: '\\',
    linux: '\/'
}

const getServerIp = async () => {
    return this.serverEnv == 'windows' ? ip.address() : await publicIp.v4().then(res => res).catch(console.log)
}

module.exports = {
    appPort: '3000',
    serverEnv: 'windows',   // 可选 'linux'  or  'windows'
    activeTableRelativePath: '/work-tables.propertries',
    splitChar: splitCharMap[this.serverEnv],
    serverIp : getServerIp
}
