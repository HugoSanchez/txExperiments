// Libraries
const envvar = require('envvar');
const bodyParser = require('body-parser').json()
const moment = require('moment');
const plaid = require('plaid');

// Directory Files
const Transaction = require('./../schemas/transactions')
const txValidator = require('../transactions/transactions')

// Plaid API access tokens (To delete)
const PLAID_CLIENT_ID = '';
const PLAID_SECRET = '';
const PLAID_PUBLIC_KEY = '';
const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

// Initialize the Plaid client
var client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV]
);

module.exports = function(app, db) {
  app.get('/ktxs/:id', (req, res) => {
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

  app.post('/ktxs', bodyParser, (req, res) => {
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

  //Plaid API routes.
  app.get('/', function(request, response, next) {
    response.render('index.ejs', {
      PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
      PLAID_ENV: PLAID_ENV,
    });
  });

  app.post('/get_access_token', function(request, response, next) {
    console.log('Hit that!!!')
    PUBLIC_TOKEN = request.body.public_token;
    console.log("MADE A REQ")
    console.log(request.body)
    client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
      if (error != null) {
        var msg = 'Could not exchange public_token!';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      }
      ACCESS_TOKEN = tokenResponse.access_token;
      ITEM_ID = tokenResponse.item_id;
      console.log('Access Token: ' + ACCESS_TOKEN);
      console.log('Item ID: ' + ITEM_ID);
      response.json({
        'error': false,
        access_token: tokenResponse.access_token,
        item_id: tokenResponse.item_id,
      });
    });
  });

  app.get('/accounts', function(request, response, next) {
    // Retrieve high-level account information and account and routing numbers
    // for each account associated with the Item.
    console.log('Authorization HEADER: ', request.headers)
    client.getAuth(request.headers.authorization, function(error, authResponse) {
      if (error != null) {
        var msg = 'Unable to pull accounts from the Plaid API.';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      }

      function totalBalances(){
        var totalSavings = 0;
        authResponse.accounts.forEach(a =>
          totalSavings = totalSavings + a.balances.current
        );
        return totalSavings;
      };

      // console.log('TotalBalance: ', totalBalances())
      // console.log('Accounts: ', authResponse.accounts);
      response.json({
        error: false,
        total_balance: totalBalances(),
        accounts: authResponse.accounts,
        numbers: authResponse.numbers,
      });
    });
  });

  app.post('/item', function(request, response, next) {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
      if (error != null) {
        console.log(JSON.stringify(error));
        return response.json({
          error: error
        });
      }

      // Also pull information about the institution
      client.getInstitutionById(itemResponse.item.institution_id, function(err, instRes) {
        if (err != null) {
          var msg = 'Unable to pull institution information from the Plaid API.';
          console.log(msg + '\n' + JSON.stringify(error));
          return response.json({
            error: msg
          });
        } else {
          response.json({
            item: itemResponse.item,
            institution: instRes.institution,
          });
        }
      });
    });
  });

  app.post('/transactions', function(request, response, next) {
    // Pull transactions for the Item for the last 30 days
    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(JSON.stringify(error));
        return response.json({
          error: error
        });
      }
      // console.log('pulled ' + transactionsResponse.transactions.length + ' transactions');
      console.log(transactionsResponse)
      response.json(transactionsResponse);
    });
  });

}; //
