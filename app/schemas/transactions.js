const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const txSchema = new Schema({
  type: String,
  amount: Number,
  from: String,
  to: String,
  nonce: Number,
  txHash: String,
  txSig: String
})

module.exports = mongoose.model('Transaction', txSchema);
