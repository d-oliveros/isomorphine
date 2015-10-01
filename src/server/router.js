var express = require('express');
var bodyParser = require('body-parser');
var createError = require('http-errors');
var debug = require('debug')('isomorphine:router');
var ctrls = require('./controllers');

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

  // Map the :entity parameter with an actual serverside entity
  router.param('entity', entityLoader(modules));

  // Proxy request pipeline
  router.post(
    '/isomorphine/:entity/:method',
    ctrls.getPayload,
    ctrls.callEntityMethod,
    ctrls.serve);

  return router;
}

/**
 * Maps the parameter "entity" to the actual server-side entity.
 *
 * @param {Object}  modules  The entities available in this api.
 * @returns {Function}       Middleware function that maps the :entity param
 *                           with the real entity, and exposes it in req.
 */
function entityLoader(modules) {
  return function(req, res, next, name) {
    debug('Looking for isomorphine entity: ' + name);

    var method = req.params.method;

    // Sets the entityName and the actual entity in the request object
    req.entityName = name;
    req.entity = modules[name];

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
  };
}

module.exports = createRouter;
