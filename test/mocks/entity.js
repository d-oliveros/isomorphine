var Promise = require('es6-promise').Promise;
var createError = require('http-errors');

exports.doSomething = doSomething;
exports.doSomethingAsync = doSomethingAsync;
exports.withValidation = withValidation;
exports.withPromiseValidation = withPromiseValidation;
exports.withError = withError;

function doSomething() {
  return 'did something.';
}

function doSomethingAsync(firstParam, secondParam, callback) {
  setTimeout(function() {
    callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
  }, 300);
}

doSomethingAsync.middleware = [middleware1, middleware2];


function middleware1(req, res, next) {
  next();
}

function middleware2(req, res, next) {
  if (req.payload && req.payload[0] === 'Prohibited value') {
    return res.sendStatus(401);
  }

  next();
}

function withValidation() {
  return 'this should get through.';
}

withValidation.validate = function(req, res, payload) {
  if (payload[0] !== 'expected-param') {
    return false;
  }
};

function withPromiseValidation() {
  return 'this should get through after resolving promise.';
}

withPromiseValidation.validate = function(req, res, payload) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
        if (payload[0] !== 'expected-param') {
          reject(createError(408));
        } else {
          resolve();
        }
    }, 150);
  });
};

function withError() {
  return 'this should always break';
}

withError.validate = function() {
  return createError(503);
};
