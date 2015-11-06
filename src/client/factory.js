var Proxy = require('./proxy');
var invariant = require('../util').invariant;
var debug = require('debug')('isomorphine:injector');

/**
 * Transforms the API surface area of the serverside modules
 * to Proxy instances that will transport the function calls to the server.
 *
 * @warn
 *  Isomorphine determines your entities' methods by scanning the file structure
 *  of the base directory. Every folder represents an entity,
 *  whereas every file in each folder represents an API endpoint, or "route".
 *
 * @see  /lib/client/proxy.js
 *
 * @providesModule clientFactory
 *
 * @param  {Object|String}  entityMap
 *  A map of the entities to proxy, or the absolute path to the entities' base dir.
 *
 *  If a string is provided, Isomorphine's webpack loader should
 *  generate a map of the entity's file structure automatically for you.
 *
 * @return  {Object}  A proxied mirror of the serverside entities.
 */
module.exports = function proxyFactory(entityMap) {
  var proxies = {};

  invariant(typeof entityMap === 'object', 'Entity map is not an object. '+
    '(Hint: Are you sure you are using the webpack loader?)');

  for (var modName in entityMap) {
    if (entityMap.hasOwnProperty(modName)) {
      proxies[modName] = new Proxy(modName, entityMap[modName]);
    }
  }

  proxies.config = function(config) {
    if (typeof config !== 'object' || config === null) {
      throw new Error('Config is not valid');
    }

    for (var modName in entityMap) {
      if (proxies.hasOwnProperty(modName)) {
        if (config.host) {
          proxies[modName]._host = config.host;
        }
        if (config.port) {
          proxies[modName]._port = config.port;
        }
      }
    }
  };

  debug('Loaded entity mirror proxies in the browser: ', proxies);

  return proxies;
};
