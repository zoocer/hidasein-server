var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')

const requestIp = require('request-ip')
const mongoose = require('mongoose')
const assert = require('assert')

const url = 'mongodb://localhost:27017/'
const dbName = 'hidasein'

const Talk = require('./models/Talk')
const func = require('./utils/func')

mongoose.connect(url + dbName, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', function() {
  console.log('db connected')
})

var app = express()

app.use(requestIp.mw())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Token'
  )
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  next()
})

app.use('/', indexRouter)

app.use((err, req, res, next) => {
  if (err.statusCode === 404) {
    res.status(404)
  } else if (err) {
    console.error(err)
    const code = err.statusCode || err.status || 500
    res.status(code).send({
      code: code,
      msg: err.message || 'something bad happend',
      data: null
    })
  } else {
    next()
  }
})

const env = func.getEnv()
console.log('=== app start ===', env);
// const port = process.argv[2] || 4141
const port = env === 'development' ? 4142 : 4141
app.listen(port, () => {
  console.log('Hidasein server is listenning on port: ', port)
})

module.exports = app;
