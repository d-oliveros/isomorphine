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
module.exports = function apiFactory(routerFactory, bodyParser) {
  var router = routerFactory();

  if (bodyParser) {
    router.use(bodyParser);
  }

  // Map the :entity parameter with an actual serverside entity
  router.param('entity', ctrls.entityLoader);

  // Proxy request pipeline
  router.all(
    '/isomorphine/:entity/:method',
    ctrls.getPayload,
    ctrls.runMiddleware,
    ctrls.callEntityMethod,
    ctrls.serve);

  return router;
};
