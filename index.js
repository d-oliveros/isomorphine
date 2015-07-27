var util = require('./lib/util');

/**
 * API surface area
 */
exports = module.exports = require('./lib/webpack-loader');
exports.api              = require('./lib/api');
exports.Proxy            = require('./lib/proxy');
exports.router           = require('./lib/router');
exports.config           = util.config;
exports.registerEntity   = util.registerEntity;
exports.resetEntities    = util.resetEntities;
