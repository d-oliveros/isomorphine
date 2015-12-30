var changeConfig = require('../util').changeConfig;
var invariant = require('../util').invariant;
var isObject = require('../util').isObject;
var isBoolean = require('../util').isBoolean;
var emptyFunction = require('../util').emptyFunction;
var createProxiedMethod = require('./createProxiedMethod');
var debug = require('debug')('isomorphine:injector');

/**
 * Transforms the API surface area of the serverside modules
 * to Proxy instances that will transport the function calls to the server.
 *
 * Isomorphine determines the server methods by recursively
 * scanning the  file structure of the base directory.
 *
 * Every file represents a serverside method, and every folder is
 * recursively scanned to map the server methods.
 *
 * @see  /lib/client/createProxiedMethod.js
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
  invariant(typeof entityMap === 'object', 'Entity map is not an object. '+
    '(Hint: Are you sure you are using the webpack loader?)');

  var config = getConfig();
  var morphine = createProxies(config, entityMap);

  morphine.config = changeConfig.bind(this, config);

  // Mocks the `morphine.router` property.
  // This is only used in the server.
  morphine.router = {
    listen: emptyFunction
  };

  debug('Loaded entity mirror proxies in the browser: ', morphine);

  return morphine;
};

/**
 * Creates proxied methods using a provided map. If parentPath is provided,
 * it will be used to build the proxied method's endpoint.
 * @param  {Object}  map         The entity map to use.
 * @param  {Array}   parentPath  The path to the parent entity.
 */
function createProxies(config, map, parentPath) {
  parentPath = parentPath || [];

  var isBase = parentPath.length === 0;
  var proxies = {};
  var path;

  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      if (isObject(map[key])) {
        proxies[key] = createProxies(config, map[key], parentPath.concat([key]));
      }
      else if (isBoolean(map[key])) {
        path = parentPath.join('/') + (isBase ? '' : '/') + key;
        proxies[key] = createProxiedMethod(config, path);
      }
    }
  }

  return proxies;
}

/**
 * Gets the default configuration based on environmental variables
 * @return {Object}  Initial config
 */
function getConfig() {
  var defaultLocation = {
    port: '80',
    hostname: 'localhost',
    protocol: 'http:'
  };

  var wLocation = (global.location && global.location.port && global.location.protocol)
    ? global.location
    : defaultLocation;

  var location = {
    port: wLocation.port || '80',
    host: wLocation.protocol + '//' + wLocation.hostname
  };

  var config = {
    port: process.env.ISOMORPHINE_PORT || location.port,
    host: process.env.ISOMORPHINE_HOST || location.host
  };

  return config;
}
