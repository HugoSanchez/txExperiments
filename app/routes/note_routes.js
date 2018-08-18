const Transaction = require('./../schemas/transactions')
const txValidator = require('../transactions/transactions')
const bodyParser = require('body-parser').json()

module.exports = function(app, db) {
  app.get('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('transactions').findOne(details, (err, item) => {
      if (err) {
        res.send({ 'error' : 'An error has ocurred'});
      } else {
        res.send(item)
      }
    });
  });

  app.post('/transactions', bodyParser, (req, res) => {
    var enoughBalance = null;
    var tx = txValidator.parseTx(req)

    if (txValidator.validateTx(tx) === true) {
      var updateBalancesPromise = txValidator.updateBalances(tx)
      updateBalancesPromise.then(function(result){
        enoughBalance = result
        if (enoughBalance === true) {
          res.send('Transaction confirmed!!')
        } else if (enoughBalance === false) {
          res.send('Sorry, not enough funds')
        }else{
          res.send("Error, please try again")
        }
      })
    } else {
      res.send('Invalid transaction')
    }
  });

  app.put('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    const tx = { text: req.body.body, title: req.body.title };
    db.collection('transactions').update(details, tx, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has ocurred' });
      } else {
        res.send(tx);
      }
    });
  })

  app.delete('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('transactions').remove(details, (err, item) => {
      if (err) {
        res.send({'error': 'An error as ocurred'});
      } else {
        res.send('Note ' + id + ' deleted!');
      }
    });
  });

};
