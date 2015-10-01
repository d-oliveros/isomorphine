var debug = require('debug')('isomorphine:util');
var config = require('../config');

/**
 * @providesModule util
 */
exports.emptyFunction     = emptyFunction;
exports.firstFunction     = firstFunction;
exports.serializeCallback = serializeCallback;
exports.config            = configInterface;
exports.invariant         = invariant;

/**
 * An empty function.
 */
function emptyFunction() {}

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
 * Transforms the client's callback function to a callback notice string.
 *
 * @param  {Array}  args  Array of arguments to transform.
 * @return {Array}        The transformed arguments array.
 */
function serializeCallback(args) {
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

/**
 * Gets/Sets the configuration object.
 *
 * @param  {Object}  config  The config to load.
 * @return {Object}          The current configuration.
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
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
  if (format === undefined) {
    throw new Error('invariant requires an error message argument');
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
