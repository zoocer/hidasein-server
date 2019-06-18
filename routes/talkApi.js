const _ = require('lodash')
const Talk = require('../models/Talk')
const randomIpv4 = require('random-ipv4')
const geoip = require('geoip-country')
const Redis = require('ioredis')
const moment = require('moment')

const redis = new Redis(6379)

exports.getTalks = async (req, res, next) => {
  try {
    const page = req.query.page || 0
    const pageSize = 5
    Talk.find(
      {},
      null,
      { skip: pageSize * page, limit: pageSize, sort: { date: -1 } },
      function(err, talks) {
        if (err) {
          next(err)
          return
        }
        res.json(talks)
      }
    )
  } catch (e) {
    next(e)
  }
}

exports.createTalk = async (req, res, next) => {
  try {
    // let ip = req.clientIp
    let ip = randomIpv4()
    let lastDate = await redis.get(ip)
    console.log(`last date for ${ip}: `, lastDate)
    let diff = moment().diff(lastDate, 'days')
    console.log('diff days: ', diff)
    if (diff < 1) {
      res.json({
        code: 400,
        data: { message: 'Only one submition is allowed in 24 hours' }
      })
      return
    }
    await redis.set(ip, new Date())
    let geo = geoip.lookup(ip)
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

    res.json(talk)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
