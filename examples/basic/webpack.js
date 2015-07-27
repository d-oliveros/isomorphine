var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

webpack(webpackConfig).run(function(err) {
  if (err) console.error(err);
});
