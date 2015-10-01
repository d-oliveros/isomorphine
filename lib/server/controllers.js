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
  req.async = false;
  req.payload = req.body.payload || [];

  // Determines if the request is asynchronous or not
  req.payload.forEach(function(arg, i) {
    if (arg === '__clientCallback__') {
      req.async = true;
      req.clientCallbackIndex = i;
    }
  });

  debug('Got ' + (req.async ? 'async ' : '') + 'payload: ' +
    JSON.stringify(req.payload, null, 3));

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
