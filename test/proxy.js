import isomorphic from '../src/isomorphic';
import {expect} from 'chai';

describe('Client proxy', () => {
  let Entity;

  before(() => {
    isomorphic.removeEntity('Entity');
    Entity = isomorphic('Entity', {}, { browser: true });
  });

  it('should proxy properties', () => {
    expect(Entity.doSomething).to.be.a('function');
    expect(Entity.whatever).to.be.a('function');
  });
});
