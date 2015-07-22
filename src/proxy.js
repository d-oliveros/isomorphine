import request from 'request';

export default function createProxy(name) {
  return new Proxy({}, {
    get(target, method) {
      return (...args) => {
        let callback;

        if (!method) {
          throw new Error(`Method is required.`);
        }

        // Transform the callback function to a string
        args = args.map((arg, index) => {
          if (typeof arg !== 'function') return arg;

          // There shouldn't be an argument after the callback function
          if (args[index + 1]) {
            throw new Error(`Callback function should be the last argument.`);
          }

          callback = arg;

          return '__clientCallback__';
        });

        request.post(`/${name}/${method}`, { args }, (err, res) => {
          // @todo handle errors better

          if (err) {
            console.error(err);
            if (callback) {
              callback(err);
            }
            return;
          }

          let data = res.data;

          if (data.constructor !== Array) {
            return callback(new Error(`Data returned from server is not an array.`));
          }

          callback(null, ...data);
        });
      };
    }
  });
}
