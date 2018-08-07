const Transaction = require('./../schemas/transactions')
let transactionValidator = require('../transactions/transactions')
let bodyParser = require('body-parser').json()

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

    let tx = new Transaction(transactionValidator.parseTx(req))

    if (transactionValidator.validateTx(transactionValidator.parseTx(req)) === true) {
      tx.save((err, result) => {
        if (err) {
          res.send({ 'error': 'An error has ocurred' });
        } else {
          res.send('Transaction confirmed!!');
        }
      });
    } else {
      res.send('Sorry, invalid transation')
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
