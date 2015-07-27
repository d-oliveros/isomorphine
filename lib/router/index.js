var ctrls = require('./controllers');
var entityLoader = ctrls.entityLoader;
var getPayload = ctrls.getPayload;
var callEntityMethod = ctrls.callEntityMethod;
var serve = ctrls.serve;

/**
 * Creates a Router using an injectable `routerFactory` like express or any
 * connect-style router. If `bodyParser` is provided, it will be used as the
 * initial middleware step.
 *
 * @param {Function}  routerFactory  A function that should return a
 *                                   connect-style router.
 * @param {Function}  bodyParser     An optional body parser middleware.
 * @returns {Function}               A `routerFactory` instance.
 *
 * @providesModule router
 */
module.exports = function apiFactory(routerFactory, bodyParser) {
  var router = routerFactory();

  if (bodyParser) {
    router.use(bodyParser);
  }

  router.param('entity', entityLoader);
  router.all('/isomorphine/:entity/:method', getPayload, callEntityMethod, serve);
  return router;
};
