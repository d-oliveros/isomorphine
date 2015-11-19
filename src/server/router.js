var express = require('express');
var bodyParser = require('body-parser');
var createError = require('http-errors');
var debug = require('debug')('isomorphine:router');
var isObject = require('../util').isObject;
var isES6Function = require('../util').isES6Function;
var getES6Function = require('../util').getES6Function;
var ctrls = require('./controllers');

var getPayload = ctrls.getPayload;
var callEntityMethod = ctrls.callEntityMethod;
var serve = ctrls.serve;

/**
 * Creates an express or connect-styled router,
 * and exposes the provided modules in the router's API surface area.
 *
 * @param {Object}  modules  The entities to use.
 * @returns {Function}       An express app instance.
 *
 * @providesModule router
 */
function createRouter(modules) {
  debug('Creating a new router. Modules: ' + JSON.stringify(modules, null, 3));

  var router = express();
  router.use(bodyParser.json());

  // Map the requested entity path with the actual serverside entity
  router.use('/isomorphine', methodLoader(modules));

  // Proxy request pipeline
  router.post('/isomorphine/*', getPayload, callEntityMethod, serve);

  return router;
}

/**
 * Maps the parameter "entity" to the actual server-side entity.
 *
 * @param {Object}  modules  The entities available in this api.
 * @returns {Function}       Middleware function that maps the :entity param
 *                           with the real entity, and exposes it in req.
 */
function methodLoader(modules) {
  return function(req, res, next) {
    if (req.path === '/') return next();

    var path = req.path.substr(1).split('/');
    var currModule = modules;
    var isLastIndex, p, method;

    debug('Looking for isomorphine entity in: ' + path.join('.'));

    for (var i = 0, len = path.length; i < len; i++) {
      isLastIndex = i === (len - 1);
      p = path[i];

      // Expect a function when last index
      if (isLastIndex && isES6Function(currModule[p])) {
        method = getES6Function(currModule[p]);
      }

      // Expect an object when not last index
      else if (!isLastIndex && isObject(currModule[p])) {
        currModule = currModule[p];
      }

      // Return a 404 if the entity was not found
      else {
        return next(createError(404, 'No method found at this path'));
      }
    }

    // Reference the serverside method in req
    debug('Entity found');
    req.serversideMethod = method;

    next();
  };
}

module.exports = createRouter;
