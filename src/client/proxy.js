var request = require('superagent');
var debug = require('debug')('isomorphine:proxy');
var util = require('../util');
var config = require('../../config');

var invariant = util.invariant;

/**
 * Creates a new Proxy.
 * Serializes the parameters sent in the function's call,
 * and sends a POST request to isomorphine's endpoint in the server.
 *
 * @param  {String}  name       The name of this entity.
 * @param  {Object}  entityMap  The entity map to be used.
 *
 * @return {Object}             Instance of `Proxy`
 *
 * @providesModule   Proxy
 */
function Proxy(name, entityMap) {
  debug('Creating a new proxy: ' + name);

  this.name = name;

  for (var method in entityMap) {
    if (entityMap.hasOwnProperty(method)) {
      this[method] = this.proxyDispatcher.bind(this, method);
    }
  }
}

/**
 * Sends a request to the server
 * @param  {[type]} method [description]
 *
 * @return {[type]}        [description]
 */
Proxy.prototype.proxyDispatcher = function(method) {
  invariant(method, 'Method is required.');

  // Get the arguments that should be passed to the server
  var payload = Array.prototype.slice.call(arguments).slice(1);

  // Save the callback function for later use
  var callback = util.firstFunction(payload) || util.emptyFunction;

  // Transform the callback function in the arguments into a special key
  // that will be used in the server to signal the client-side callback call
  payload = util.serializeCallback(payload);

  var endpoint = this.buildEndpoint(method);

  debug('Calling API endpoint: ' + endpoint + '.');

  request
    .post(endpoint)
    .send({ payload: payload })
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if ((!res || !res.body) && !err) {
        err = new Error('No response from server. ' +
          '(Hint: Have you mounted isomorphine.router() in your app?)');
      }

      if (err) {
        debug('API request failed.', err);
        console.error(err); // @todo handle errors better
        if (callback) {
          callback(err);
        }
        return;
      }

      var values = res.body.values;

      if (!values || values.constructor !== Array) {
        return callback(new Error('Fetched payload is not an array.'));
      }

      debug('Resolving callback with ' + JSON.stringify(values, null, 3));

      // Sets the error argument to null
      values.unshift(null);

      callback.apply(this, values);
    });
};

/**
 * Builds an entity's API endpoint.
 *
 * @param  {String}  method  The entity's method to be called.
 * @return {String}          The endpoint to request.
 */
Proxy.prototype.buildEndpoint = function(method) {
  var name = this.name;
  var host = config.host;
  var port = config.port;

  var base = host + ':' + port;
  var path = '/isomorphine/' + name + '/' + method;
  var endpoint = base + path;

  debug('Built endpoint: ' + endpoint);

  return endpoint;
};

module.exports = Proxy;
