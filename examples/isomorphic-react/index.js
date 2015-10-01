require('babel/register');

require('./server/app').listen(8800, function() {
  console.log('-- Listening on http://127.0.0.1:8800');
});
