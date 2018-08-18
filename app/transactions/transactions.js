const EthCrypto = require('eth-crypto')
var Promise = require('promise');
const mongoose = require('mongoose');
const Account = require('../schemas/accounts')

module.exports = {

  validateTx: function(tx) {
    if (EthCrypto.recover(tx.txSig, tx.txHash) === tx.from) {
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
      txHash: req.body.txHash,
      txSig: req.body.txSig
    }
    return tx
  },

  updateBalances: function(tx){
    return new Promise(function(resolve, reject) {
      Account.findOne({ address: tx.from }, function(err, acc) {
        if (err) {
          reject(err)
        } else {
          if (acc.balance > tx.amount) {
            var updatedData = { balance: acc.balance - tx.amount, nonce: acc.nonce + 1 }
            Account.update({address: tx.from}, updatedData, function(err, acc){
            if (err) return console.error(err);
          })
          Account.findOneAndUpdate({ address: tx.to }, {$set: {address: tx.to}}, {upsert:true, setDefaultsOnInsert: true, new: true}, function(err, acc){
            Account.update({address: tx.to}, {$set: {balance: acc.balance + tx.amount}}, function(err, acc){
            })
          })
            resolve(true)
          } else {
            resolve(false)
          }
        }
      });
    });
  }


} //Module
