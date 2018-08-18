const Transaction = require('./app/schemas/transactions')
const Account = require('./app/schemas/accounts')

const tx = new Transaction({
  type: "spend",
  amount: 170,
  from: "0x345387fa8A266888A83aF87151c5d0C350626318",
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


function updateBalances(){
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

updateBalances()
