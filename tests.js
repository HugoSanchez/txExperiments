const Transaction = require('./app/schemas/transactions')
const Account = require('./app/schemas/accounts')

const tx = new Transaction({
  type: "spend",
  amount: 200,
  from: "0x8C861e2a5783CD6BE0d20542e4718Ec7ed4f9618",
  to: "0xB5F7834a28681b7140a26c8A53e669bE4054b3e9",
  nonce: 0,
  txHash:
    "0x7d262aa9d37bb382998421b5c869996e32326a1f3ace1ffb8d721c60c4446dbf",
  txSig:
    "0xd910c98d04e92e520b1a629cbbdf6cf6754cf3b93acf8d1047192d380b854f6d0752381d7e713d8f959d51e168d886c8135a66ad29c04c6361eab412e15b8b031c"
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


Account.findOneAndUpdate({ address: tx.to }, {$set: {address: tx.to}}, {upsert:true}, function(err, acc){
    let currentBalance = acc.balance

    if (currentBalance === 'undefined') {
      Account.update({address: tx.to}, {$set: {balance: tx.amount, nonce: -1}}, {upsert: true}, function(err, upAcc){
        if (err) return console.error(err);
        // console.log(upAcc)
      });
    } else {
      let balance = { balance: acc.balance + tx.amount }
      Account.update({address: tx.to}, {$set: balance}, {upsert: true}, function(err, upAcc){
        if (err) return console.error(err);
        // console.log(upAcc)
      });
    }

    if (err) return console.error(err);
    // console.log(acc);
})
