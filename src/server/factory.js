var fs = require('fs');
var path = require('path');
var createRouter = require('./router');
var invariant = require('../util').invariant;
var emptyFunction = require('../util').emptyFunction;

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
  var morphine = requireMethods(baseDir);

  invariant(!morphine.hasOwnProperty('router'),
    'You can\'t use an entity with the name "router"');

  // Create the API endpoint that will listen for RPCs.
  morphine.router = createRouter(morphine);

  // Mocks the `morphine.config` method. The method does nothing in the server.
  // It is only used in the browser.
  morphine.config = emptyFunction;

  return morphine;
};

/**
 * Recursively requires the modules in current dir.
 *
 * @param  {String}  dir  The base directory to require entities from.
 * @return {Object}       An object with all the modules loaded.
 */
function requireMethods(dir) {
  if (!dir) dir = getCallerDirname();

  var modules = {};

  fs
    .readdirSync(dir)
    .filter(function(filename) {
      return filename !== 'index.js';
    })
    .forEach(function(filename) {
      var filePath = path.join(dir, filename);
      var Stats = fs.lstatSync(filePath);
      var isLink = Stats.isSymbolicLink();
      var isDir = Stats.isDirectory();
      var isFile = Stats.isFile();
      var isJS = filename.indexOf('.js') > -1;

      if (!isLink && isDir) {
        modules[filename] = requireMethods(filePath);
      }

      else if (!isLink && isFile && isJS) {
        var entityName = filename.replace('.js', '');
        modules[entityName] = require(filePath);
      }
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
