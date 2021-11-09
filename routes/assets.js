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
const Token = require('../model/token')
const cascader = require('../model/common-data/city-cascade.json')
const towns = require('../model/common-data/towns.json')
const {cloneDeep} = require('lodash')

/* GET user listing. */
router.get('/getdistricts', async function (req, res, next) {
  try {
    const {type} = req.query  //type取 1，2，3
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

router.get('/gettowns', async function (req, res, next) {
  try {
    let token = req.headers.authorization
    let user = Token.de(token)
    let {code} = user
    if(!code || code.length < 6 || code.substring(4,6) == '00') {
      response.responseSuccess([], res)
      return
    }
    if(towns[code]) {
      response.responseSuccess(towns[code], res)
      return
    } else {
      response.responseSuccess([], res)
      return
    }
  } catch (e) {
    console.log('/assets/gettowns', e.message)
    response.responseFailed(res)
  }
});

module.exports = router;