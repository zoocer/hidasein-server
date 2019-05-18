const mongoose = require('mongoose')
const Schema = mongoose.Schema

var talkSchema = new Schema({
  content: String,
  ip: String,
  code: String,
  date: { type: Date, default: Date.now }
})

var Talk = mongoose.model('Talk', talkSchema)

module.exports = Talk
