var util = require('./util');

module.exports = {
  createProxy: require('./proxy'),
  api: require('./api'),
  config: util.loadConfig,
  loadEntities: util.loadEntities,
  registerEntity: util.registerEntity,
  resetEntities: util.resetEntities
};
