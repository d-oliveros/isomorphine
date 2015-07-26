var emptyFunction = require('./empty-function');

/**
 * Returns the first function in an array.
 *
 * @param  {Array}     args  The array to take the function from.
 * @return {Function}        The resulting function. Default: An empty function.
 *
 * @providesModule     firstFunction
 */
module.exports = function firstFunction(args) {
  var func = emptyFunction;

  args.forEach(function(arg) {
    if (typeof arg === 'function') {
      func = arg;
    }
  });

  return func;
};
