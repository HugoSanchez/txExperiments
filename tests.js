const Transaction = require('./app/schemas/transactions')
const Account = require('./app/schemas/accounts')
const Acc = require('./accounts')
const EthCrypto = require('eth-crypto')

const tx = new Transaction({
  type: 'mint',
  amount: 100,
  from: '0x345387fa8A266888A83aF87151c5d0C350626318',
  to: '0x33E6af8FDbd6821C3b93b08754d3B864e128e109',
  nonce: 0,
  txHash:
   '0x86f159583746ba325fcce315c8b8180174716c183c2e3a4044e862535b3c4e3d',
  txSig:
   '0xbb038b4f848ca3f388e275800d9ce51ad1c75b44c294709389f1937498dd7a2d6bbf8ade4d7115edb56522f1e43cf7217a8f8e9115a16e6fc11e45e7f62bbc631b'
 })

const masterAccount = new Account({
  address: '0x345387fa8A266888A83aF87151c5d0C350626318',
  balance: 100000,
  nonce: -1
})

// masterAccount.save((err, acc) =>{
//   if (err) return console.error(err);
//   console.log(acc);
// })


// function updateBalances(){
//   Account.findOne({ address: tx.from }, function(err, acc) {
//     if (acc.balance > tx.amount) {
//       let updatedData = { balance: acc.balance - tx.amount, nonce: acc.nonce + 1 }
//       Account.update({address: tx.from}, updatedData, function(err, acc){
//       if (err) return console.error(err);
//     })
//     Account.findOneAndUpdate({ address: tx.to }, {$set: {address: tx.to}}, {upsert:true, setDefaultsOnInsert: true, new: true}, function(err, acc){
//       Account.update({address: tx.to}, {$set: {balance: acc.balance + tx.amount}}, function(err, acc){
//       })
//     })
//       return 'Correct'
//     } else {
//       return 'Sorry, not enough funds'
//     }
//   })
// }


const one = Acc.one

let someone = EthCrypto.createIdentity()
let someoneElse = EthCrypto.createIdentity()

function getTxHash (tx) {
  return EthCrypto.hash.keccak256(JSON.stringify(tx))
}

var transaction =
  {
    txBody: {
      type: 'mint',
      amount: 100,
      from: one.address,
      to: someone.address,
      nonce: 0
    },
}

// var signature = EthCrypto.sign(one.privateKey, getTxHash(transaction.txBody))
// transaction.txSig = signature
//
// console.log(transaction)
// console.log('Recover: ', EthCrypto.recover(transaction.txSig, getTxHash(transaction.txBody)));
// console.log('Address: ', one.address)
//
// var recovered = EthCrypto.recover(transaction.txSig, getTxHash(transaction.txBody))


// function validateTx(tx) {
//   return new Promise(function(resolve, reject){
//     if (EthCrypto.recover(tx.txSig, getTxHash(tx.txBody)) === tx.txBody.from){
//       resolve(true)
//     } else {
//       resolve(false)
//     }
//   })
// }
//
// var trial = validateTx(transaction)
//
// trial.then(function(result){
//   if (result == true) {
//     console.log('true')
//   } else {
//     console.log('false')
//   }
// })

// if (EthCrypto.recover(transaction.txSig, getTxHash(transaction.txBody)) === transaction.txBody.from){
//     console.log('Valid')
//   } else {
//     console.log('Invalid')
//   }
