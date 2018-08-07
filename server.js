const express = require('express');
// const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const mongoose = require('mongoose');

mongoose.connect(db.url);
let database = mongoose.connection;

const app = express()

const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function() {
  require('./app/routes')(app, database);

  app.listen(port, () => {
    console.log('We are live on ' + port);
  });
})
