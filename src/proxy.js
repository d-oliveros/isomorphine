var invariant = require('invariant');
var request = require('request');
var debug = require('debug')('isomorphine:proxy');
var util = require('./util');

module.exports = function proxyFactory(name, entity) {
  var proxy = {};

  debug('Creating a new proxy: ' + name);

  for (var method in entity) {
    proxy[method] = proxyDispatcher.bind(this, name, method);
  }

  return proxy;
};

function proxyDispatcher(entityName, method) {
  invariant(method, 'Method is required.');

  // Get the arguments that should be passed to the server
  var payload = Array.prototype.slice.call(arguments).slice(2);

  // Save the callback function for later use
  var callback = util.firstFunction(payload);

  // Transform the callback function in the arguments into a special key
  // that will be used in the server to signal the client-side callback call
  payload = util.transformCallback(payload);

  var endpoint = util.buildEndpoint(entityName, method);

  debug('Calling API endpoint: ' + endpoint + '.');

  var reqOptions = {
    uri: endpoint,
    method: 'post',
    json: true,
    body: { payload: payload }
  };

  request(reqOptions, function(err, res, data) {
    handleResponse(err, data, callback);
  });
}

function handleResponse(err, data, callback) {
  callback = callback || util.emptyFunction;

  if (err) {
    debug('API request failed.', err);
    console.error(err);
    // @todo handle errors better
    if (callback) {
      callback(err);
    }
    return;
  }

  var values = data.values;

  if (!values || values.constructor !== Array) {
    return callback(new Error('Fetched payload is not an array.'));
  }

  debug('Resolving callback with ' + JSON.stringify(values, null, 3));

  // Sets the error argument
  values.unshift(null);

  callback.apply(this, values);
}
