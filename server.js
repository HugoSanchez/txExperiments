'use strict';

const envvar = require('envvar');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const mongoose = require('mongoose');
const moment = require('moment');
const plaid = require('plaid');
const Transaction = require('./app/schemas/transactions');

const APP_PORT = envvar.number('APP_PORT', 3000);
const PLAID_CLIENT_ID = '';
const PLAID_SECRET = '';
const PLAID_PUBLIC_KEY = '';
const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
// var ACCESS_TOKEN = null;
// var PUBLIC_TOKEN = null;
// var ITEM_ID = null;

// // Initialize the Plaid client
// var client = new plaid.Client(
//   PLAID_CLIENT_ID,
//   PLAID_SECRET,
//   PLAID_PUBLIC_KEY,
//   plaid.environments[PLAID_ENV]
// );

//Initialize conne to db
mongoose.connect(db.url,  { useNewUrlParser: true });
let database = mongoose.connection;

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function() {
  require('./app/routes')(app, database);
  require('./app/transactions/transactions');
  // require('./tests') // Ojo con esto, habrá que quitarlo

  app.listen(APP_PORT, () => {
    console.log('We are live on ' + APP_PORT);
  });
})
