var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/client.js',
  module: {
    preLoaders: [
      {
        loaders: ['isomorphine']
      }
    ]
  },
  output: {
    path: path.resolve('./src/build'),
    filename: 'bundle.js'
  }
};
