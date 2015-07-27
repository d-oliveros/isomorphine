var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    app: [
      './client/render.js'
    ]
  },
  output: {
    path: path.resolve('../build'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:8001/build'
  },
  module: {
    preLoaders: [
      {
        loaders: ['isomorphine']
      }
    ],
    loaders: [
      {
        test: /\.(jsx|js)$/,
        loaders: ['babel']
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: 8001,
    publicPath: 'build',
    hot: true,
    contentBase: './build'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        ISOMORPHINE_PORT: 8800
      }
    })
  ]
};
