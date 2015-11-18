var promisify = require('../../../src/util').promisify;

module.exports = promisify(function returnPromise(firstParam, secondParam, callback) {
  setTimeout(function() {
    callback(null, 'Cool');
  }, 300);
});
