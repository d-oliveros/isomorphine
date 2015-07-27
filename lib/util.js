var debug = require('debug')('isomorphine:util');
var config = require('../config');
var entities = require('./stores/entities');

exports.buildEndpoint     = buildEndpoint;
exports.config            = configInterface;
exports.emptyFunction     = emptyFunction;
exports.firstFunction     = firstFunction;
exports.invariant         = invariant;
exports.registerEntity    = registerEntity;
exports.resetEntities     = resetEntities;
exports.transformCallback = transformCallback;

/**
 * Builds an entity's API endpoint.
 *
 * @param  {String}  name    The entity's name.
 * @param  {String}  method  The entity's method to be called.
 * @return {String}          The endpoint to request.
 *
 * @providesModule   buildEndpoint
 */
function buildEndpoint(name, method) {
  var protocol = config.protocol;
  var host = config.host;
  var port = config.port;

  var base = protocol + '://' + host + ':' + port;
  var path = '/isomorphine/' + name + '/' + method;
  var endpoint = base + path;

  debug('Built endpoint: ' + endpoint);

  return endpoint;
}

/**
 * Gets/Sets the configuration object.
 *
 * @param  {Object}  config  The config to load.
 * @return {Object}          The current configuration.
 *
 * @providesModule   configInterface
 */
function configInterface(newConfig) {
  if (newConfig) {
    debug('Setting new config: ', newConfig);
    for (var key in newConfig) {
      config[key] = newConfig[key];
    }
  }

  debug('Getting config: ', config);

  return config;
}

/**
 * An empty function.
 *
 * @providesModule emptyFunction
 */
function emptyFunction() {}

/**
 * Returns the first function in an array.
 *
 * @param  {Array}     args  The array to take the function from.
 * @return {Function}        The resulting function. Default: An empty function.
 *
 * @providesModule     firstFunction
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
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

function invariant(condition, format, a, b, c, d, e, f) {
  if (process.browser) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

/**
 * Registers a single entity.
 *
 * @param {String}  name    The name of the entity to register.
 * @param {Object}  entity  The entity to register.
 *
 * @providesModule  registerEntity
 */
function registerEntity(name, entity) {
  debug('Registering entity "' + name + '": ', entity);
  entities[name] = entity;
}

/**
 * Clears the entities.
 *
 * @return {Number} Number of entities removed.
 *
 * @providesModule resetEntities
 */
function resetEntities() {
  debug('Resetting entities');

  var count = Object.keys(entities).length;

  for (var id in entities) {
    delete entities[id];
  }

  return count;
}

/**
 * Transforms the client's callback function to a callback notice string.
 *
 * @param  {Array}  args  Array of arguments to transform.
 * @return {Array}        The transformed arguments array.
 *
 * @providesModule transformCallback
 */
function transformCallback(args) {
  var callback;

  debug('Transforming callback in ', args);

  return args.map(function(arg) {
    if (typeof arg !== 'function') return arg;

    // It shouldn't be an argument after the callback function
    invariant(!callback, 'Only one callback function is allowed.');

    callback = arg;

    return '__clientCallback__';
  });
}
