const globalRoutes = require('./global_routes');

module.exports = function(app, db) {
  globalRoutes(app, db);
}
