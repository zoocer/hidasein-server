const _ = require('lodash')
const Talk = require('../models/Talk')
const randomIpv4 = require('random-ipv4')
const geoip = require('geoip-country')
const Redis = require('ioredis')
const moment = require('moment')

const redis = new Redis(6379)

// 获取talks列表
exports.getTalks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 0
    const pageSize = parseInt(req.query.pageSize, 10) || 5
    Talk.find(
      {},
      null,
      { skip: pageSize * page, limit: pageSize, sort: { date: -1 } },
      function(err, talks) {
        if (err) {
          next(err)
          return
        }
        res.json({
          code: 200,
          msg: 'success',
          data: talks
        })
      }
    )
  } catch (e) {
    console.error(e)
    next(e)
  }
}
// 创建talk
exports.createTalk = async (req, res, next) => {
  try {
    // let ip = req.clientIp
    let ip = randomIpv4()
    // let ip = '127.0.0.3'
    let lastDate = await redis.get(ip)
    console.log(`last date for ${ip}: `, lastDate)
    let diff = moment().diff(lastDate, 'days')
    console.log('diff days: ', diff)
    if (diff < 1) {
      res.json({
        code: 400,
        msg: 'Only one submition is allowed in 24 hours',
        data: null
      })
      return
    }
    await redis.set(ip, new Date())
    let geo = geoip.lookup(ip)
    console.log('geo', geo)
    let code = ''
    if (geo) {
      code = _.lowerCase(geo.country)
    }
    let talk = new Talk()
    talk.content = req.body.content
    talk.ip = ip
    talk.code = code
    talk.date = Date.now()
    await talk.save()

    res.json({
      code: 200,
      msg: 'success',
      data: talk
    })
  } catch (e) {
    console.error(e)
    next(e)
  }
}
// 获取客户端geo信息
exports.getClientGeoInfo = async (req, res, next) => {
  try {
    // let ip = req.clientIp
    let ip = randomIpv4()
    let geo = geoip.lookup(ip)
    console.log('geo', geo)
    res.json({
      code: 200,
      msg: 'success',
      data: geo
    })
  } catch (e) {
    console.error(e)
    next(e)
  }
}
// 检查24小时内是否已经发过talk
exports.checkTalked = async (req, res, next) => {
  try {
    // let ip = req.clientIp
    let ip = randomIpv4()
    // let ip = '127.0.0.3'
    let lastDate = await redis.get(ip)
    let diff = moment().diff(lastDate, 'days')
    console.log('checkTalked diff days: ', diff)
    res.json({
      code: 200,
      msg: 'success',
      data: {
        talked: diff < 1
      }
    })
  } catch (e) {
    console.error(e)
    next(e)
  }
}
