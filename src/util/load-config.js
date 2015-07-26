var config = require('../../config');
var debug = require('debug')('isomorphine:util');

/**
 * Loads a configuration object.
 *
 * @param  {Object}  config  The config to load.
 * @return {Object}          The current configuration.
 *
 * @providesModule   loadConfig
 */
module.exports = function loadConfig(newConfig) {
  if (newConfig) {
    debug('Setting new config: ', newConfig);
    for (var key in newConfig) {
      config[key] = newConfig[key];
    }
  }

  debug('Getting config: ', config);

  return config;
};
