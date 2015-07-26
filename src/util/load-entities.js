var fs = require('fs');
var path = require('path');
var invariant = require('./invariant');
var registerEntity = require('./register-entity');

var debug = require('debug')('isomorphine:util');

/**
 * Requires every module in each folder of "rootDir".
 *
 * @param  {String}  rootDir  Path to folder to require from.
 * @return {Object}           Required modules.
 *
 * @providesModule   loadEntities
 */
module.exports = function loadEntities(rootDir) {
  invariant(rootDir, 'Root directory is required.');

  debug('Loading all entities in ' + rootDir);

  var modules = {};
  var files = fs.readdirSync(rootDir);

  files.forEach(function(file) {
    if (file.indexOf('.js') < 0) {
      registerEntity(file, modules[file]);
      modules[file] = require(path.join(rootDir, file));
    }
  });

  return modules;
};
