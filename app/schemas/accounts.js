const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  address: String,
  balance: {type: Number, default: 0},
  nonce: {type: Number, default: -1}
})

module.exports = mongoose.model('Account', accountSchema);
