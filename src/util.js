var debug = require('debug')('isomorphine:util');
var Promise = global.Promise || require('es6-promise').Promise;

/**
 * @providesModule util
 */
exports.emptyFunction     = emptyFunction;
exports.firstFunction     = firstFunction;
exports.serializeCallback = serializeCallback;
exports.promisify         = promisify;
exports.isObject          = isObject;
exports.isBoolean         = isBoolean;
exports.isFunction        = isFunction;
exports.isPromise         = isPromise;
exports.changeConfig      = changeConfig;
exports.invariant         = invariant;

/**
 * An empty function.
 */
function emptyFunction() {}

/**
 * Returns the first function in an array.
 *
 * @param  {Array}     args  The array to take the function from.
 * @return {Function}        The resulting function, or null.
 */
function firstFunction(args) {
  for (var i = 0, len = args.length; i < len; i++) {
    if (typeof args[i] === 'function') {
      return args[i];
    }
  }

  return null;
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
 * Transforms a callback-based function flow to a promise-based flow
 */
function promisify(func) {
  return function promisified() {
    var args = Array.prototype.slice.call(arguments);
    var context = this;

    return new Promise(function(resolve, reject) {
      try {
        func.apply(context, args.concat(function(err, data) {
          if (err) {
            return reject(err);
          }

          resolve(data);
        }));
      } catch(err) {
        reject(err);
      }
    });
  };
}

/**
 * Checks if the passed in variable is an object.
 * @param  {Mixed}  obj  The variable to check.
 * @return {Boolean}     True if the variable is an object.
 */
function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Checks if the passed in variable is a boolean.
 * @param  {Mixed}  obj  The variable to check.
 * @return {Boolean}     True if the variable is a Boolean.
 */
function isBoolean(obj) {
  return typeof obj === 'boolean';
}

/**
 * Checks if the passed in variable is a function.
 * @param  {Mixed}  obj  The variable to check.
 * @return {Boolean}     True if the variable is a Function.
 */
function isFunction(obj) {
  return typeof obj === 'function';
}

/**
 * Checks if the passed in variable is a promise.
 * @param  {Mixed}  obj  The variable to check.
 * @return {Boolean}     True if the variable is a promise.
 */
function isPromise(obj) {
  return typeof obj === 'object' && typeof obj.then === 'function';
}

/**
 * Updates a config object
 * @param  {Object}  oldConfig  Old configuration object
 * @param  {Object}  newConfig  New configuration object
 * @return {Undefined}
 */
function changeConfig(oldConfig, newConfig) {
  invariant(isObject(oldConfig), 'Old config is not valid');
  invariant(isObject(newConfig), 'Config is not valid');

  if (newConfig.host) {
    oldConfig.host = newConfig.host;
  }

  if (newConfig.port) {
    oldConfig.port = newConfig.port;
  }
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
