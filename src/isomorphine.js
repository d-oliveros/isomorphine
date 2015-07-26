var util = require('./util');

module.exports = {
  Proxy: require('./proxy'),
  router: require('./router'),

  config:          util.loadConfig,
  loadEntities:    util.loadEntities,
  registerEntity:  util.registerEntity,
  resetEntities:   util.resetEntities
};
