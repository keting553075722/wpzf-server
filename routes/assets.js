/**
 * @name: districts
 * @author: zzhe
 * @date: 2021/11/3 11:06
 * @description: districts
 * @update: 2021/11/3 11:06
 */

var express = require('express');
var router = express.Router();
const currentTime = require('../model/get-current-time')
const response = require('../model/response-format')
const cascader = require('../model/common-data/city-cascade.json')
const {cloneDeep} = require('lodash')

/* GET user listing. */
router.get('/getdistricts', async function (req, res, next) {
  try {
    const {type} = req.query  //type取 1，2，3
    // let cascadeCity = cloneDeep(cascader)
    // if (type == '1') {
    //   delete cascadeCity[0].children
    // } else if (type == '2') {
    //   cascadeCity[0].children.forEach(cityItem => {
    //     delete cityItem.children
    //   })
    // } else if (type == '3') {
    //
    // } else {
    //   cascadeCity = []
    // }
    const returnRes = {}
    let cascadeCity = cloneDeep(cascader)
    delete cascadeCity[0].children
    returnRes['1'] = cloneDeep(cascadeCity)

    cascadeCity = cloneDeep(cascader)
    cascadeCity[0].children.forEach(cityItem => {
      delete cityItem.children
    })
    returnRes['2'] = cloneDeep(cascadeCity)

    cascadeCity = cloneDeep(cascader)
    returnRes['3'] = cloneDeep(cascadeCity)
    response.responseSuccess(returnRes, res)
  } catch (e) {
    console.log('/assets/getdistricts', e.message)
    response.responseFailed(res)
  }
});

module.exports = router;