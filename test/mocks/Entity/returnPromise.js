var promisify = require('promisify-node');

module.exports = promisify(function returnPromise(firstParam, secondParam, callback) {
  setTimeout(function() {
    callback(null, 'Cool');
  }, 300);
});
