const EthCrypto = require('eth-crypto')
const mongoose = require('mongoose');
// const Transaction = require('./schemas/transactions')

module.exports = {

  validateTx: function(tx) {
    if (EthCrypto.recover(tx.sig, tx.hash) === tx.from) {
      return true
    } else {
      return false
    }
  },

  parseTx: function(req) {
    const tx = {
      type: req.body.type,
      amount: req.body.amount,
      from: req.body.from,
      to: req.body.to,
      nonce: req.body.nonce,
      hash: req.body.hash,
      sig: req.body.sig
    }
    return tx
  }


} //
