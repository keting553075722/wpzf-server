// 本地调试配置
const localConfig = {
  'appPort': '3000',
  'serverEnv': 'windows',
  'activeTableRelativePath': '/work-tables.propertries',
  'ddConfig': {
    'domain': 'https://openplatform.dg-work.cn',
    'appid': 'wpzf_dingoa-JFyyCo81V2EYyEVN3m',
    'appkey': 'wpzf_dingoa-JFyyCo81V2EYyEVN3m',
    'appsecret': 'YuE274if7KQQqLVpELWsIFjl901hU7WI0BAMf2qg',
    'REDIRECT_URI': 'http://localhost:8083/'
  }
}

// 线上专有钉钉9999
const linux9999Config = {
  'appPort': '3999',
  'serverEnv': 'linux',
  'activeTableRelativePath': '/work-tables.propertries',
  'ddConfig': {
    'domain': 'https://openplatform.dg-work.cn',
    'appid': 'wpzf9999_dingoa-3rujDve2uMrqee',
    'appkey': 'wpzf9999_dingoa-3rujDve2uMrqee',
    'appsecret': 'NvZO2Gr4qMh2trC3915E7pyRA2P76FKAw2yfJ4Qp',
    'REDIRECT_URI': 'http://121.196.170.251:9999/'
  }
}

// 线上浙政钉8083
const linux8083Config = {
  'appPort': '3008',
  'serverEnv': 'linux',
  'activeTableRelativePath': '/work-tables.propertries',
  'ddConfig': {
    'domain': 'https://openplatform-pro.ding.zj.gov.cn',
    'appid': 'zrzywpzf_dingoa-SbZZKxeBZBnyei',
    'appkey': 'zrzywpzf_dingoa-SbZZKxeBZBnyei',
    'appsecret': 'XttO7A3HKTPVYRctlUB6Ng1j53JXJsnramVZT36V',
    'REDIRECT_URI': 'http://121.196.170.251:8083/'
  }
}

// 政务网浙政钉配置
const zjGovConfig = {
  'appPort': '',
  'serverEnv': 'windows',
  'activeTableRelativePath': '/work-tables.propertries',
  'ddConfig': {
    'domain': '',
    'appid': '',
    'appkey': '',
    'appsecret': '',
    'REDIRECT_URI': ''
  }
}
// {localConfig, linux8083Config, linux9999Config, zjGovConfig}
module.exports = localConfig

