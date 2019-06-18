var express = require('express')
var router = express.Router()
const talkApi = require('./talkApi')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/talks', talkApi.getTalks)
router.post('/talks', talkApi.createTalk)

module.exports = router
