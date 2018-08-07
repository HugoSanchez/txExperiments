const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  address: String,
  balance: Number,
  nonce: Number
})

module.exports = mongoose.model('Account', accountSchema);
