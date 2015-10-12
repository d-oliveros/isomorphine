var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

module.exports = function(callback) {
  var config = require('../webpack.config.js');
  var compiler = webpack(config);

  var webpackDevServerConf = {
    hot: true,
    publicPath: config.output.publicPath
  };

  var devServer = new WebpackDevServer(compiler, webpackDevServerConf);

  devServer.listen(config.devServer.port, config.devServer.host, function(err) {
    if (err) callback(err);
  });
};
