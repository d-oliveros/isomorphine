var debug = require('debug')('isomorphine:util');
var entities = require('../stores/entities');

/**
 * Clears the entities.
 *
 * @return {Number} Number of entities removed.
 *
 * @providesModule resetEntities
 */
module.exports = function resetEntities() {
  debug('Resetting entities');

  var count = Object.keys(entities).length;

  for (var id in entities) {
    delete entities[id];
  }

  return count;
};
