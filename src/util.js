var invariant = require('invariant');
var entities = require('./entities');
var config = require('./config');

exports.transformCallback = transformCallback;
exports.firstFunction = firstFunction;
exports.buildEndpoint = buildEndpoint;
exports.loadConfig = loadConfig;
exports.loadEntities = loadEntities;
exports.registerEntity = registerEntity;
exports.resetEntities = resetEntities;
exports.emptyFunction = emptyFunction;

/**
 * Transforms the client's callback function to a callback notice string.
 *
 * @param  {Array}  args  Array of arguments to transform.
 * @return {Array}        The transformed arguments array.
 */
function transformCallback(args) {
  var callback;

  return args.map(function(arg) {
    if (typeof arg !== 'function') return arg;

    // It shouldn't be an argument after the callback function
    invariant(!callback, 'Only one callback function is allowed.');

    callback = arg;

    return '__clientCallback__';
  });
}

/**
 * Returns the first function in an array.
 *
 * @param  {Array}     args  The array to take the function from.
 * @return {Function}        The resulting function. Default: An empty function.
 */
function firstFunction(args) {
  var func = emptyFunction;

  args.forEach(function(arg) {
    if (typeof arg === 'function') {
      func = arg;
    }
  });

  return func;
}

/**
 * Builds an entity's API endpoint.
 *
 * @param  {String}  name    The entity's name.
 * @param  {String}  method  The entity's method to be called.
 * @return {String}          The endpoint to request.
 */
function buildEndpoint(name, method) {
  var protocol = config.protocol;
  var host = config.host;
  var port = config.port;

  return protocol + '://' + host + ':' + port + '/' + name + '/' + method;
}

/**
 * Requires every module in each folder of "dirname".
 *
 * @param  {String}  dirname  Path to folder to require from.
 * @return {Object}           Required modules.
 */
function loadEntities(dirname) {
  if (process.browser) return;

  invariant(dirname, 'dirname is required.');
  var fs = require('fs');
  var path = require('path');

  var modules = {};
  var files = fs.readdirSync(dirname);

  files.forEach(function(file) {
    if (file.indexOf('.js') < 0) {
      registerEntity(file, modules[file]);
      modules[file] = require(path.join(dirname, file));
    }
  });

  return modules;
}

/**
 * Loads a configuration object.
 *
 * @param  {Object}  config  The config to load.
 * @return {Object}          The current configuration.
 */
function loadConfig(newConfig) {
  if (newConfig) {
    for (var key in newConfig) {
      config[key] = newConfig[key];
    }
  }

  return config;
}

/**
 * Registers a single entity.
 *
 * @param {String}  name    The name of the entity to register.
 * @param {Object}  entity  The entity to register.
 */
function registerEntity(name, entity) {
  entities[name] = entity;
}

/**
 * Clears the entities.
 *
 * @return {Number} Number of entities removed.
 */
function resetEntities() {
  if (process.browser) return;

  var count = Object.keys(entities).length;

  for (var id in entities) {
    delete entities[id];
  }

  return count;
}

/**
 * Empty function
 */
function emptyFunction() {

}
