import proxy from './proxy';

let entities = {};

export default function isomorphic(name, entity, options={}) {
  if (process.browser || options.browser) {
    return proxy(name);
  }

  if (entities[name]) {
    throw new Error(`Entity ${name} was registered twice.`);
  }

  // Register this entity
  entities[name] = entity;

  return entity;
}

isomorphic.getEntity = (name) => entities[name] || null;
isomorphic.removeEntity = (name) => delete entities[name];
