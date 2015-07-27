var Proxy = require('./proxy');
var invariant = require('./util').invariant;
var debug = require('debug')('isomorphine:injector');

/**
 * Browser version of the API factory. If `isomorphine-loader` is not installed,
 *
 * @requires isomorphine-loader
 *
 * @param  {String}  rootDir  Path to folder to require from.
 * @return {Object}           Required modules.
 *
 * @providesModule   browserApi
 */
module.exports = function browserApiFactory(rootDir, map) {
  var modules = {};

  invariant(typeof map === 'object', 'Entity map is required. '+
    '(Hint: Are you sure you are using "isomorphine-loader"?)');

  for (var modName in map) {
    modules[modName] = Proxy(modName, map[modName]);
  }

  debug('Loaded isomorphic entities in the browser: ', modules);

  return modules;
};
