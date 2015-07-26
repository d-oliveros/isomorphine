var invariant = require('./invariant');
var debug = require('debug')('isomorphine:util');

/**
 * Transforms the client's callback function to a callback notice string.
 *
 * @param  {Array}  args  Array of arguments to transform.
 * @return {Array}        The transformed arguments array.
 *
 * @providesModule transformCallback
 */
module.exports = function transformCallback(args) {
  var callback;

  debug('Transforming callback in ', args);

  return args.map(function(arg) {
    if (typeof arg !== 'function') return arg;

    // It shouldn't be an argument after the callback function
    invariant(!callback, 'Only one callback function is allowed.');

    callback = arg;

    return '__clientCallback__';
  });
};
