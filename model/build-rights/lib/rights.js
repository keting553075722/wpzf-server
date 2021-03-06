/**
 * @Description: 权限列表
 * @author zzh
 * @createTime 2021/4/24
 */
/**
 * 卫片图斑主路由对应所有权限
 * ['batch','district', 'report','dispatch','codeKey'] header上所有选择框的权限
 * ['refresh', 'upload','sendDown'] header上所有button的权限
 * ['view', 'evidence'] table上操作button的权限
 */

const cityCascade = require('../../common-data/city-cascade')
const province = [
    {
        id: 11,
        authName: "卫片图斑",
        icon: "el-icon-menu",
        path: "/main",
        tag: "jdtb",
        cascade: cityCascade[0].children,
        rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDownProv', 'view', 'details-reback'],
        children: [
            {
                id: 111,
                authName: "省级审核",
                icon: "el-icon-menu",
                path: "/main/sjsh",
                tag: "sjsh",
                cascade: cityCascade[0].children,
                rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDown', 'view', 'details-reback'],
                children: [],
            }, {
                id: 112,
                authName: "省级卫片",
                icon: "el-icon-menu",
                path: "/main/jdtb",
                tag: "",
                cascade: cityCascade[0].children,
                rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDownProv', 'view', 'details-reback'],
                children: [],
            }, {
                id: 113,
                authName: "长江流域执法",
                icon: "el-icon-menu",
                path: "/main/cjly",
                tag: "cjly",
                cascade: cityCascade[0].children,
                rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDown', 'view'],
                children: [],
            }
            // , {
            //     id: 114,
            //     authName: "重点监测",
            //     icon: "el-icon-menu",
            //     path: "/main/zdjc",
            //     tag: "zdjc",
            //     cascade: cityCascade[0].children,
            //     rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'upload', 'sendDown', 'view'],
            //     children: [],
            // },
        ],
    },
    {
        id: 13,
        authName: "图斑审核",
        icon: "el-icon-s-check",
        path: "/main/tbsh",
        tag: "tbsh",
        rights: [],
        children: [],
    }
    , {
        id: 14,
        authName: "统计分析",
        icon: "el-icon-pie-chart",
        path: "/main/tjfx",
        tag: "tjfx",
        rights: [],
        children: [],
    }, {
        id: 15,
        authName: "任务进度",
        icon: "el-icon-s-operation",
        path: "/main/tbjk",
        tag: "tbjk",
        rights: [],
        children: [],
    }, {
        id: 16,
        authName: "任务定制",
        icon: "el-icon-monitor",
        path: "/main/rwdz",
        tag: "rwdz",
        rights: [],
        children: [],
    }
]

const city = [
    {
        id: 21,
        authName: "卫片图斑",
        icon: "el-icon-menu",
        path: "/main/jdtb",
        tag: "jdtb",
        rights: ['batch', 'district', 'dispatch', 'codeKey', 'refresh', 'sendDown', 'view'],
        children: [],
    }
    , {
        id: 22,
        authName: "图斑上报",
        icon: "el-icon-s-promotion",
        path: "/main/tbsb",
        tag: "tbsb",
        rights: ['batch', 'check', 'codeKey', 'refresh'],
        children: [],
    }
    , {
        id: 23,
        authName: "图斑审核",
        icon: "el-icon-s-check",
        path: "/main/tbsh",
        tag: "tbsh",
        rights: [],
        children: [],
    }
]

const county = [
    {
        id: 31,
        authName: "卫片图斑",
        icon: "el-icon-menu",
        path: "/main/jdtb",
        tag: "jdtb",
        rights: ['batch', 'evidence', 'codeKey', 'refresh', 'view', 'evidence', 'townsFilter'], //县级图斑界面的权限
        children: [],
    }
    , {
        id: 32,
        authName: "图斑上报",
        icon: "el-icon-s-promotion",
        path: "/main/tbsb",
        tag: "tbsb",
        rights: ['batch', 'evidence', 'codeKey', 'refresh'],
        children: []
    }
]



module.exports = {
    province, city, county
}
