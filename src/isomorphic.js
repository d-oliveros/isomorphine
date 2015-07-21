import invariant from 'invariant';
import proxyHandler from './proxyHandler';

let entities = {};

export default function isomorphic(name, entity) {
  if (process.browser) {
    return new Proxy({}, proxyHandler);
  }

  invariant(!entities[name], `Entity ${name} was registered twice.`);

  // Register this entity
  entities[name] = entity;

  return entity;
}

isomorphic.getEntity = (name) => entities[name] || null;
