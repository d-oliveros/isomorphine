
module.exports = {
  doSomething: function() {
    return 'did something.';
  },
  doSomethingAsync: function(firstParam, secondParam, callback) {
    setTimeout(function() {
      callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
    }, 300);
  }
};
