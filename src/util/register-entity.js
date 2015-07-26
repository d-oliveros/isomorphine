var debug = require('debug')('isomorphine:util');
var entities = require('../stores/entities');

/**
 * Registers a single entity.
 *
 * @param {String}  name    The name of the entity to register.
 * @param {Object}  entity  The entity to register.
 *
 * @providesModule  registerEntity
 */
module.exports = function registerEntity(name, entity) {
  debug('Registering entity "' + name + '": ', entity);
  entities[name] = entity;
};
