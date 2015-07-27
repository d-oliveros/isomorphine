var ctrls = require('./controllers');
var entityLoader = ctrls.entityLoader;
var getPayload = ctrls.getPayload;
var callEntityMethod = ctrls.callEntityMethod;
var serve = ctrls.serve;

/**
 * @providesModule router
 */
module.exports = function apiFactory(routerFactory, bodyParser) {
  var router = routerFactory();
  router.use(bodyParser);
  router.param('entity', entityLoader);
  router.all('/isomorphine/:entity/:method', getPayload, callEntityMethod, serve);
  return router;
};
