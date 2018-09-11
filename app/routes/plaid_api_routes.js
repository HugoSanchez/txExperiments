// Libraries
const envvar = require('envvar');
const bodyParser = require('body-parser').json()
const moment = require('moment');
const plaid = require('plaid');

//Files
const plaidKeys = require('../../config/plaid_keys.js')

// Plaid API access tokens (To delete)
const PLAID_CLIENT_ID = plaidKeys.PLAID_CLIENT_ID;
const PLAID_SECRET = plaidKeys.PLAID_SECRET;
const PLAID_PUBLIC_KEY = plaidKeys.PLAID_PUBLIC_KEY;
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

  app.get('/', function(request, response, next) {
    response.render('index.ejs', {
      PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
      PLAID_ENV: PLAID_ENV,
    });
  });

  app.post('/get_access_token', function(request, response, next) {
    PUBLIC_TOKEN = request.body.public_token;
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
        access_token: ACCESS_TOKEN
      });
    });
  });

  app.get('/accounts', function(request, response, next) {
    // Retrieve high-level account information and account and routing numbers
    // for each account associated with the Item.
    console.log('MADE A REQ!!!!!!!!!!!!!!!!!!!!!!! TO ACCOUNTS!!!!!!!!')
    client.getAuth(request.headers.authorization, function(error, authResponse) {
      if (error != null) {
        var msg = 'Unable to pull accounts from the Plaid API.';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      }

      const TotalBalance = () => {
        var tb = 0;
        authResponse.accounts.forEach(a => tb = tb + a.balances.current)
        return tb;
      }

      console.log(authResponse.accounts);
      response.json({
        error: false,
        accounts: authResponse.accounts,
        numbers: authResponse.numbers,
        total_balance: TotalBalance(),
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
    console.log('REQ BODY:', request.body)
    console.log('MADE A REQ!!!!!!!!!!!!!!!!!!!!!!!')
    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    client.getTransactions(request.body.access_token, startDate, endDate, {
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
}
