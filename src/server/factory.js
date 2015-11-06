var fs = require('fs');
var path = require('path');
var createRouter = require('./router');
var util = require('../util');

/**
 * Creates an isomorphine endpoint router with entities loaded from 'baseDir'.
 *
 * @warn
 *  Isomorphine determines your entities' methods by scanning the file structure
 *  of the base directory. Every folder represents an entity,
 *  whereas every file in each folder represents an API endpoint, or "route".
 *
 * @see  /lib/server/router.js
 *
 * @providesModule   serverFactory
 *
 * @param  {String}  baseDir  Path to folder to require from.
 * @return {Object}           Required modules.
 */
module.exports = function routerFactory(baseDir) {
  var entities = requireEntities(baseDir);

  util.invariant(!entities.hasOwnProperty('router'),
    'You can\'t use an entity with the name "router"');

  // Create the API endpoint that will listen for RPCs.
  entities.router = createRouter(entities);

  // The config method does nothing in the server.
  // It is only used when called from the browser.
  entities.config = util.emptyFunction;

  return entities;
};

/**
 * Requires the entities in dir.
 *
 * @param  {String}  dir  The base directory to require entities from.
 * @return {Object}       An object with all the modules loaded.
 */
function requireEntities(dir) {
  if (!dir) dir = getCallerDirname();

  var modules = {};
  var entities = fs.readdirSync(dir);

  entities.forEach(function(entity) {
    if (entity.indexOf('.js') > -1) return; // Only get folders

    var methods = fs.readdirSync(path.join(dir, entity));

    methods.forEach(function(method) {
      if (method.indexOf('.js') < 0 || method === 'index.js') return;
      method = method.replace('.js', '');
      modules[entity] = modules[entity] || {};
      modules[entity][method] = require(path.join(dir, entity, method));
    });
  });

  return modules;
}

/**
 * Gets the dirname of the caller function that is calling this method.
 * @return {String}  Absolute path to the caller's directory.
 */
function getCallerDirname() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  var err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  var requester = stack[2].getFileName();

  return path.dirname(requester);
}
