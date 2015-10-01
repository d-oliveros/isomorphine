
module.exports = function doSomethingAsync(firstParam, secondParam, callback) {
  setTimeout(function() {
    callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
  }, 300);
};
