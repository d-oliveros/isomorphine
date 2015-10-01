var series = require('async-each-series');
var createError = require('http-errors');
var entities = require('../stores/entities');
var util = require('../util');
var debug = require('debug')('isomorphine:router');

exports.entityLoader = entityLoader;
exports.getPayload = getPayload;
exports.runMiddleware = runMiddleware;
exports.runValidation = runValidation;
exports.callEntityMethod = callEntityMethod;
exports.serve = serve;

/**
 * Maps the parameter "entity" to the actual server-side entity.
 */
function entityLoader(req, res, next, name) {
  debug('Looking for isomorphine entity: ' + name);

  var method = req.params.method;

  // Sets the entityName and the actual entity in the request object
  req.entityName = name;
  req.entity = entities[name];

  if (!req.entity) {
    return next(createError(400, 'Entity ' + name + ' is not registered.'));
  }

  if (!method) {
    return next(createError(400, 'No method requested for entity ' + name));
  }

  if (typeof req.entity[method] !== 'function') {
    return next(createError(400, 'Method ' + method + ' is not a function.'));
  }

  next();
}

/**
 * Processes the client-side payload, and transforms the client-side
 * callback function signal to an actual callback function
 */
function getPayload(req, res, next) {
  req.async = false;

  req.payload = (req.body.payload || []);

  // Determines if the request is asynchronous or not
  req.payload.forEach(function(arg, i) {
    if (arg === '__clientCallback__') {
      req.async = true;
      req.clientCallbackIndex = i;
    }
  });

  debug('Got ' + (req.async ? 'async ' : '') + 'payload: ' + JSON.stringify(req.payload));

  next();
}

/**
 * Runs the entity middleware, if any.
 */
function runMiddleware(req, res, next) {
  var method = req.entity[req.params.method];

  if (!Array.isArray(method.middleware)) {
    return next();
  }

  series(method.middleware, function(middleware, next) {
    middleware(req, res, next);
  }, next);
}

/**
 * Runs the entity validation method, if any.
 */
function runValidation(req, res, next) {
  var method = req.entity[req.params.method];

  if (typeof method.validate !== 'function') {
    return next();
  }

  var payload = req.payload;
  var result = method.validate(req, res, payload);

  var isBoolean = typeof result === 'boolean';
  var isPromise = typeof result === 'object' && typeof result.then === 'function';

  if (isBoolean && !result) {
    return next(createError(401));
  }

  if (result instanceof Error) {
    return next(result);
  }

  if (isPromise) {
    return result.then(function() {
      next();
    }, function(err) {
      next(err || createError(401));
    });
  }

  next();
}

/**
 * Calls the server-side entity, and returns the results to the client
 */
function callEntityMethod(req, res, next) {
  var payload = req.payload;
  var entityName = req.entityName;
  var method = req.params.method;

  if (req.async) {
    debug('Transforming callback function');

    payload[req.clientCallbackIndex] = function(err) {
      if (err) {
        return next(err);
      }

      var values = Array.prototype.slice.call(arguments).slice(1);

      debug('Callback function called. Values are:', values);

      res.entityResponse = values;

      next();
    };
  }

  debug('Calling ' + entityName + '.' + method + '() with arguments:', payload);

  var context = {
    req: req,
    xhr: true
  };

  // Calls the requested serverside method.
  // Applies the payload, and provides a context for validation purposes.
  // Caches errors in the method's scope, and sends it to the next error handler.
  try {
    req.entity[method].apply(context, payload);
  } catch(err) {
    return next(err);
  }

  // If the request is not expecting the response from the entity,
  // send a generic 'Ok' response.
  if (!req.async) {
    res.entityResponse = ['Ok'];
    debug('Not asynchronous. Returning value: ', res.entityResponse);
    next();
  }
}

/**
 * Serves the value in req.entityResponse as a JSON object.
 */
function serve(req, res) {
  util.invariant(Array.isArray(res.entityResponse), 'Response values are required.');
  res.json({ values: res.entityResponse });
}
