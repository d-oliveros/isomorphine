var util = require('./util');

module.exports = {
  Proxy: require('./proxy'),
  api: require('./api'),
  config: util.loadConfig,
  loadEntities: util.loadEntities,
  registerEntity: util.registerEntity,
  resetEntities: util.resetEntities
};
