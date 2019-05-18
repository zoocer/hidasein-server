const _ = require('lodash')
const Talk = require('../models/Talk')
const randomIpv4 = require('random-ipv4')
const geoip = require('geoip-country')

exports.getTalks = async (req, res, next) => {
  try {
    Talk.find({}, null, { sort: { date: -1 } }, function(err, talks) {
      if (err) {
        next(err)
        return
      }
      res.json(talks)
    })
  } catch (e) {
    next(e)
  }
}

exports.createTalk = async (req, res, next) => {
  try {
    // let ip = req.clientIp
    let ip = randomIpv4()
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
