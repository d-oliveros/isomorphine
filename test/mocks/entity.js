var createError = require('http-errors');

exports.doSomething = doSomething;
exports.doSomethingAsync = doSomethingAsync;
exports.withContext = withContext;
exports.withValidation = withValidation;

function doSomething() {
  return 'did something.';
}

function doSomethingAsync(firstParam, secondParam, callback) {
  setTimeout(function() {
    callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
  }, 300);
}

function withContext(callback) {
  if (!this.xhr) return callback(createError(400, 'XHR was not true'));
  if (!this.req) return callback(createError(400, 'Request was not present'));

  callback();
}

function withValidation(key, callback) {
  if (key !== 'thekey') return callback(createError(401));

  callback();
}
