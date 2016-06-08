var util = require('../util');
var debug = require('debug')('isomorphine:controllers');

/**
 * @providesModule controllers
 */
exports.getPayload       = getPayload;
exports.callEntityMethod = callEntityMethod;
exports.serve            = serve;

/**
 * Processes the client-side payload, and transforms the client-side
 * callback function signal to an actual callback function
 */
function getPayload(req, res, next) {
  req.hasCallback = false;
  req.payload = req.body.payload || [];

  // Determines if the request is asynchronous or not
  req.payload.forEach(function(arg, i) {
    if (arg === '__clientCallback__') {
      req.hasCallback = true;
      req.clientCallbackIndex = i;
    }
  });

  debug('Got payload' + (req.hasCallback ? ' with callback' : '') + ': ' +
    JSON.stringify(req.payload, null, 3));

  next();
}

/**
 * Calls the server-side entity, and returns the results to the client
 */
function callEntityMethod(req, res, next) {
  var payload = req.payload;
  var method = req.serversideMethod;

  if (req.hasCallback) {

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

  debug('Calling ' + req.path + ' with arguments:', payload);

  var context = {
    req: req,
    xhr: true,
    setCookie: res.cookie.bind(res),
    clearCookie: res.clearCookie.bind(res)
  };

  var ret;

  // Calls the requested serverside method.
  // Applies the payload, and provides a context for validation purposes.
  // Caches errors in the method's scope, and sends it to the next error handler.
  try {
    ret = method.apply(context, payload);
  } catch(err) {
    return next(err);
  }

  if (util.isPromise(ret)) {
    ret.then(function(resolved) {
      res.entityResponse = [resolved];
      next();
    })
    .catch(function(err) {
      next(err);
    });
  }

  // If the request is not expecting the response from the entity,
  // send a generic 'Ok' response.
  else if (!req.hasCallback) {
    res.entityResponse = [ret];
    debug('Not asynchronous. Returning value: ', res.entityResponse);
    next();
  }
}

/**
 * Serves the value in req.entityResponse as a JSON object.
 */
function serve(req, res) {
  var responseIsArray = Array.isArray(res.entityResponse);
  util.invariant(responseIsArray, 'Response values are required.');

  res.json({ values: res.entityResponse });
}
