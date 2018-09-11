const globalRoutes = require('./global_routes');
const plaidRoutes = require('./plaid_api_routes');
const sessionRoutes = require('./session_routes')

module.exports = function(app, db) {
  globalRoutes(app, db);
  plaidRoutes(app, db);
  sessionRoutes(app, db);
}
