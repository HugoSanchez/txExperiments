const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
// const TX = require('./transactions/transactions')

const app = express()

const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

MongoClient.connect(db.url, (err, database) => {
  if (err) return console.log(err)
  require('./app/routes')(app, database);

  app.listen(port, () => {
    console.log('We are live on ' + port);
  });
})

// MongoClient.connect(db.url, function(err, db) {
//   if (err) throw err;
//   var query = { amount: 2000}
//   db.collection('transactions').find({from: '0x1DcfbA9fA5453B99f7C358D66B86a919cEBCDeE5'}).toArray(function(err, result){
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
