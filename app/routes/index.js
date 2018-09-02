const globalRoutes = require('./global_routes');
const plaidRoutes = require('./plaid_api_routes');
const userRoutes = require('./user_routes')

module.exports = function(app, db) {
  globalRoutes(app, db);
  plaidRoutes(app, db);
  userRoutes(app, db);
}
