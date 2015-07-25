var entities = require('../stores/entities');
var debug = require('debug')('isomorphine:controllers');

exports.entityLoader = entityLoader;
exports.getPayload = getPayload;
exports.serveRequest = serveRequest;

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
    return next(new Error('Entity ' + name + ' is not registered.'));
  }

  if (!method) {
    return next(new Error(400, 'No method requested for entity ' + name));
  }

  if (typeof req.entity[method] !== 'function') {
    return next(new Error(400, 'Method ' + method + ' is not a function.'));
  }

  next();
}


/**
 * Processes the client-side payload, and transforms the client-side
 * callback function signal to an actual callback function
 */
function getPayload(req, res, next) {
  req.async = false;

  debug('Formatting payload: ' + JSON.stringify(req.body.payload));

  // Transform the '__clientCallback__' argument to an actual callback func
  req.payload = (req.body.payload || []).map(function(arg) {
    if (arg !== '__clientCallback__') return arg;

    req.async = true;

    return function(err) { //eslint-disable-line
      if (err) {
        return next(err);
      }

      var values = Array.prototype.slice.call(arguments).slice(1);
      debug('Callback function called. Values are:', values);

      res.json({ values: values });
    };
  });

  debug('Request is async? ' + req.async + '. Arguments are:', req.payload);

  next();
}

/**
 * Calls the server-side entity, and returns the results to the client
 */
function serveRequest(req, res, next) {
  var payload = req.payload;
  var entityName = req.entityName;
  var method = req.params.method;

  debug('Calling ' + entityName + '.' + method + '() with arguments:', payload);

  try {
    req.entity[method].apply(this, payload);
  } catch(err) {
    return next(err);
  }

  // If the request is not expecting the response from the entity,
  // send a generic 'Ok' response.
  if (!req.async) {
    res.json({ values: ['Ok'] });
  }
}
