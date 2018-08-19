const EthCrypto = require('eth-crypto')
var Promise = require('promise');
const mongoose = require('mongoose');
const Account = require('../schemas/accounts')


function getTxHash(tx) {
  return EthCrypto.hash.keccak256(JSON.stringify(tx))
}

module.exports = {

  validateTx: function(tx) {
    if (EthCrypto.recover(tx.txSig, getTxHash(tx.txBody)) === tx.txBody.from) {
      return true
    } else {
      return false
    }
  },

  parseTx: function(req) {
    const tx = {
      txBody: {
        type: req.body.txBody.type,
        amount: req.body.txBody.amount,
        from: req.body.txBody.from,
        to: req.body.txBody.to,
        nonce: req.body.txBody.nonce,
      },
      txSig: req.body.txSig
    }
    return tx
  },

  updateBalances: function(tx){
    return new Promise(function(resolve, reject) {
      Account.findOne({ address: tx.txBody.from }, function(err, acc) {
        if (err) {
          reject(err)
        } else {
          if (acc.balance > tx.txBody.amount) {
            var updatedData = { balance: acc.balance - tx.txBody.amount, nonce: acc.nonce + 1 }
            Account.update({address: tx.txBody.from}, updatedData, function(err, acc){
            if (err) return console.error(err);
          })
          Account.findOneAndUpdate({ address: tx.txBody.to }, {$set: {address: tx.txBody.to}}, {upsert:true, setDefaultsOnInsert: true, new: true}, function(err, acc){
            Account.update({address: tx.txBody.to}, {$set: {balance: acc.balance + tx.txBody.amount}}, function(err, acc){
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
