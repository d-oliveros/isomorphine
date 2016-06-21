var request = require('superagent');
var debug = require('debug')('isomorphine:createProxiedMethod');
var util = require('../util');

/**
 * Creates a new proxied method.
 * Serializes the parameters sent in the function's call,
 * and sends a POST request to isomorphine's endpoint in the server.
 *
 * @param  {Object}  params  The server's configuration and error handlers.
 * @param  {Object}  path    The path to the serverside method to be called.
 *
 * @return {Function}
 *  A proxied method that when called, will serialize the parameters
 *  in the function's call, and send a POST request to isomorphine's
 *  endpoint in the server.
 *
 * @providesModule createProxiedMethod
 */
module.exports = function createProxiedMethod(params, path) {
  debug('Creating a new proxied method with path "' + path + '"');
  return proxiedMethod.bind({}, params, path);
};

/**
 * Serializes the parameters sent in the function's call,
 * and sends a POST request to isomorphine's endpoint in the server.
 *
 * @param  {Object}  params  The server's configuration and error handlers.
 * @param  {Object}  path    The path to the serverside method to be called.
 */
function proxiedMethod(params, path) {

  // Get the arguments that should be passed to the server
  var payload = Array.prototype.slice.call(arguments).slice(2);

    // Save the callback function for later use
  var callback = util.firstFunction(payload);

  // Transform the callback function in the arguments into a special key
  // that will be used in the server to signal the client-side callback call
  payload = util.serializeCallback(payload);

  var endpoint = buildEndpoint(params, path);

  if (callback) {
    return doRequest(endpoint, payload, params, callback);
  } else {
    return util.promisify(doRequest)(endpoint, payload, params);
  }
}

/**
 * Runs a request to an isomorphine's endpoint with the provided payload.
 *
 * @param  {String}   endpoint  The endpoint to request.
 * @param  {Array}    payload   The arguments to send.
 * @param  {Object}   params    The server's configuration and error handlers.
 * @param  {Function} callback  The callback function to call afterwards.
 */
function doRequest(endpoint, payload, params, callback) {
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
        return handleError(err, params, callback);
      }

      var values = res.body.values;

      if (!values || values.constructor !== Array) {
        err = new Error('Fetched payload is not an array.');
        return handleError(err, params, callback);
      }

      debug('Resolving callback with ' + JSON.stringify(values, null, 3));

      // Sets the error argument to null
      values.unshift(null);

      callback.apply(this, values);
    });
}

function handleError(err, params, callback) {
  util.invariant(typeof params === 'object', 'Params is required');

  debug('API request failed.', err);
  if (params.errorHandlers instanceof Array) {
    params.errorHandlers.forEach(function(handler) {
      handler(err);
    });
  }

  if (typeof callback === 'function') {
    callback(err);
  }
}

/**
 * Builds a method's API endpoint.
 *
 * @param  {Object}  config  The host and port parameters to use.
 * @param  {String}  path    The path to the serverside method.
 * @return {String}          The endpoint to request.
 */
function buildEndpoint(config, path) {
  var host = config.host;
  var port = config.port;

  if (!host) throw new Error('No host is specified in proxied method config');

  var base = host + (port ? ':' + port : '');
  var fullpath = '/isomorphine/' + path;
  var endpoint = base + fullpath;

  debug('Built endpoint: ' + endpoint);

  return endpoint;
}
