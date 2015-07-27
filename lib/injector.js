var fs = require('fs');
var path = require('path');
var util = require('./util');

var debug = require('debug')('isomorphine:injector');

/**
 * Wraps the modules in `rootDir` with isomorphine, so the browser can use them.
 *
 * @param  {String}  rootDir  Path to folder to require from.
 * @return {Object}           Required modules.
 *
 * @providesModule   inject
 */
module.exports = function injector(rootDir) {
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
