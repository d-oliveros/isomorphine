
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

module.exports.doSomethingAsync.middleware = [middleware1, middleware2];

function middleware1(req, res, next) {
  next();
}

function middleware2(req, res, next) {
  if (req.payload && req.payload[0] === 'Prohibited value') {
    return res.sendStatus(401);
  }

  next();
}
