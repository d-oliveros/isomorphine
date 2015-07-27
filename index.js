var util = require('./lib/util');

/**
 * Webpack loader
 */
exports = module.exports = require('./lib/webpack-loader');

/**
 * API surface area
 */
exports.inject           = require('./lib/injector');
exports.Proxy            = require('./lib/proxy');
exports.router           = require('./lib/router');
exports.config           = util.config;
exports.registerEntity   = util.registerEntity;
exports.resetEntities    = util.resetEntities;
