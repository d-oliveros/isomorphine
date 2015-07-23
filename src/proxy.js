import invariant from 'invariant';

let request = require('request').defaults({ json: true });
let debug = require('debug')('morphic:proxy');

export default function createProxy(name) {
  debug(`Creating a new proxy: ${name}`);

  return new Proxy({}, {
    get(target, method) {
      debug(`Accessing property ${method} of ${name}`);

      return (...args) => {
        invariant(method, 'Method is required.');

        const port = process.env.ISOMORPHIC_API_PORT || '80';
        const host = process.env.ISOMORPHIC_API_HOST || 'localhost';
        const endpoint = `http://${host}:${port}/${name}/${method}`;

        let callback = transformCallback(args);

        debug(`Calling API endpoint: ${endpoint}.`);

        request.post(endpoint, { body: { args }}, (err, res, { values }) => {
          if (err) {
            debug(`API request failed.`, err);
            console.error(err);
            // @todo handle errors better
            if (callback) {
              callback(err);
            }
            return;
          }

          if (!values || values.constructor !== Array) {
            let error = new Error(`Data returned from server is not an array.`);
            return callback(error);
          }

          debug(`Resolving callback with ${JSON.stringify(values)}`);

          callback(null, ...values);
        });
      };
    }
  });
}

/**
 * Transforms the client's callback function, to a callback notice string,
 *
 * @param  {Array}     args  Array of arguments to transform.
 * @return {Function}        The original callback function.
 */
function transformCallback(args) {
  let callback;

  args.forEach((arg, i) => {
    if (typeof arg !== 'function') return;

    // There shouldn't be an argument after the callback function
    invariant(args.length === (i+1), `Callback function should be the last argument.`);

    callback = args[i];
    args[i] =  '__clientCallback__';
  });

  return callback;
}
