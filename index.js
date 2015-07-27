var util = require('./lib/util');

/**
 * @providesModule isomorphine
 */
module.exports = {
  api:             require('./lib/api'),
  Proxy:           require('./lib/proxy'),
  router:          require('./lib/router'),
  config:          util.config,
  registerEntity:  util.registerEntity,
  resetEntities:   util.resetEntities
};
