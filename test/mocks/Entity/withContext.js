var createError = require('http-errors');

module.exports = function withContext(callback) {
  if (!this.xhr) return callback(createError(400, 'XHR was not true'));
  if (!this.req) return callback(createError(400, 'Request was not present'));

  callback();
};
