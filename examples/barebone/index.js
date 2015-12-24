var fs = require('fs');
var path = require('path');

if (!fs.existsSync(path.resolve(__dirname, 'src', 'build', 'bundle.js'))) {
  return console.log('Please start the app with "npm start"')
}

require('./src/server');
