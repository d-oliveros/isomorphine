var express = require('express');
var bodyParser = require('body-parser');
var ctrls = require('./controllers');

/**
 * Creates a Router using an injectable `routerFactory` (express or any
 * connect-style router).
 *
 * If the entity requested has defined middleware functions, those will be
 * run after getting the request's payload.
 *
 * If `bodyParser` is provided, it will be used as the
 * initial middleware step.
 *
 * @param {Function}    routerFactory  A function that should return a
 *                                     connect-style router.
 * @param {Function}    bodyParser     An optional body parser middleware.
 * @returns {Function}                 A `routerFactory` instance.
 *
 * @providesModule router
 */
var router = express();
router.use(bodyParser.json());

// Map the :entity parameter with an actual serverside entity
router.param('entity', ctrls.entityLoader);

// Proxy request pipeline
router.post(
  '/isomorphine/:entity/:method',
  ctrls.getPayload,
  ctrls.runMiddleware,
  ctrls.runValidation,
  ctrls.callEntityMethod,
  ctrls.serve);

module.exports = router;
