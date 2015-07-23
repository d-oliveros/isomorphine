import invariant from 'invariant';
import proxy from './proxy';

let debug = require('debug')('morphic');

let entities = {};

export default function morphic(name, entity, options={}) {
  if (process.browser || options.browser) return proxy(name);

  invariant(!entities[name], `Entity ${name} was registered twice.`);

  debug(`Registering entity: ${name}`);
  entities[name] = entity;

  return entity;
}

morphic.getEntity = (name) => {
  debug(`Getting entity: ${name}`);
  return entities[name] || null;
};

morphic.removeEntity = (name) => {
  debug(`Removing entity: ${name}`);
  delete entities[name];
};
