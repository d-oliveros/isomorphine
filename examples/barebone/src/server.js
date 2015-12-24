var express = require('express');
var morphine = require('./api');

var app = express();

// Mounts the rpc layer middleware. This will enable remote function calls
app.use(morphine.router);

 // Serve static files in this folder
app.use('/', express.static(__dirname + '/'));

// Listen on port 3000
app.listen(3000, function(err) {
  if (err) return console.log(err.stack);

  // Creates a user when you boot up the server
  // This is only to demostrate we can use the same code on server side...
  var User = morphine.User;

  User.create({ _id: 5, name: 'someone' }, function(err, user) {
    if (err) console.error(err.stack);

    console.log('App listening on http://127.0.0.1:3000');
  });
});
