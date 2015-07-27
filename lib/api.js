var fs = require('fs');
var path = require('path');
var util = require('./util');

var debug = require('debug')('isomorphine:api');

/**
 * Creates an isomorphine API using the passed parameter as the API's root
 *
 * @param  {String}  rootDir  Path to folder to require from.
 * @return {Object}           Required modules.
 *
 * @providesModule   api
 */
module.exports = function apiFactory(rootDir) {
  util.invariant(rootDir, 'Root directory is required.');

  debug('Loading all entities in ' + rootDir);

  var modules = {};
  var files = fs.readdirSync(rootDir);

  files.forEach(function(file) {
    if (file.indexOf('.js') < 0) {
      modules[file] = require(path.join(rootDir, file));
      util.registerEntity(file, modules[file]);
    }
  });

  debug('Loaded entities: ', modules);

  return modules;
};
