var fs = require('fs');
var path = require('path');

/**
 * Webpack loader for isomorphine.
 * @type {webpack.Loader}
 *
 * Transforms isomorphine.proxy({String}) to isomorphine.proxy({Object}).
 * It generates an entity map from the provided path passed to isomorphine.proxy
 * without requiring its modules.
 *
 * It doesn't require the module itself to prevent serverside entities
 * to be bundled together, thus avoiding leaking sensitive data
 * and non-browser-compatible libraries.
 *
 * @providesModule webpack-loader
 *
 * @param  {String}  source  The file's source code.
 * @return {String}          The transformed file's source code.
 */
module.exports = function webpackLoader(source) {
  if (this.cacheable) {
    this.cacheable();
  }

  if (source.indexOf('isomorphine.proxy(') < 0) {
    return source;
  }

  var rootdir = getRootdir(this.context, source);
  var map = getModuleMapSync(rootdir);

  source = source.replace(/isomorphine\.proxy\(.*\)/, '__isomorphicAPIFactory()');

  source += '\n' + (
    'function __isomorphicAPIFactory() {\n' +
    '  var __entityMap = ' + JSON.stringify(map) + ';\n' +
    '  return isomorphine.proxy(__entityMap);\n' +
    '}'
  );

  return source;
};

/**
 * Gets the absolute path to the rootdir argument of the isomorphic.proxy() call.
 *
 * @param  {String}  context  The absolute path to the file's directory.
 * @param  {String}  source   The file's source code.
 *
 * @return {String}           The absolute path, as sent to isomorphine.
 */
function getRootdir(context, source) {
  var regexMatch = source.match(/isomorphine.proxy\((.*)\)/);
  var target = '';

  if (regexMatch) {
    target = regexMatch[1];

    if (target[0] === '\'' || target[0] === '"') {
      target = target.substr(0, target.length - 1).substr(1);
    }

    if (target === '__dirname') {
      target = context;
    }

  }

  return path.resolve(context, target);
}

/**
 * Maps a directory and generates the module interface map synchronously.
 * @todo Make this asynchronous.
 *
 * @param  {dir}  dir  Absolute path to the directory.
 * @return {Object}    Module interface map.
 */
function getModuleMapSync(dir) {
  var map = {};

  fs
    .readdirSync(dir)
    .filter(function(file) {
      return file.indexOf('.js') < 0;
    })
    .forEach(function(entityName) {
      var entityPath = path.join(dir, entityName);

      fs
        .readdirSync(entityPath)
        .filter(function(file) {
          return file !== 'index.js' && file.indexOf('.js') > -1;
        })
        .forEach(function(file) {
          var method = file.replace('.js', '');
          map[entityName] = map[entityName] || {};
          map[entityName][method] = true;
        });
    });

  return map;
}
