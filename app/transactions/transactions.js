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

  updateBalances: function(tx){
    Account.findOne({ address: tx.from }, function(err, acc) {
      if (acc.balance > tx.amount) {
        let updatedData = { balance: acc.balance - tx.amount, nonce: acc.nonce + 1 }
        Account.update({address: tx.from}, updatedData, function(err, acc){
        if (err) return console.error(err);
      })
      Account.findOneAndUpdate({ address: tx.to }, {$set: {address: tx.to}}, {upsert:true, setDefaultsOnInsert: true, new: true}, function(err, acc){
        Account.update({address: tx.to}, {$set: {balance: acc.balance + tx.amount}}, function(err, acc){
        })
      })
        return 'Correct'
      } else {
        return 'Sorry, not enough funds'
      }
    })
  }


} //
