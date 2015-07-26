var debug = require('debug')('isomorphine:util');
var config = require('../../config');

/**
 * Builds an entity's API endpoint.
 *
 * @param  {String}  name    The entity's name.
 * @param  {String}  method  The entity's method to be called.
 * @return {String}          The endpoint to request.
 *
 * @providesModule   buildEndpoint
 */
module.exports = function buildEndpoint(name, method) {
  var protocol = config.protocol;
  var host = config.host;
  var port = config.port;

  var base = protocol + '://' + host + ':' + port;
  var path = '/isomorphine/' + name + '/' + method;
  var endpoint = base + path;

  debug('Built endpoint: ' + endpoint);

  return endpoint;
};
