var createError = require('http-errors');

module.exports = function withValidation(key, callback) {
  if (key !== 'thekey') return callback(createError(401));

  callback();
};
