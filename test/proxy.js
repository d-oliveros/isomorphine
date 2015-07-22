import {expect} from 'chai';
import isomorphic from '../src/isomorphic';
import api from '../src/api';
import entityMock from './mocks/entityMock';

describe('Client proxy', () => {
  let Entity;

  before((done) => {
    isomorphic.removeEntity('Entity');
    Entity = isomorphic('Entity', entityMock, { browser: true });

    api.listen(8880, done);
  });

  it('should proxy properties', () => {
    expect(Entity.doSomething).to.be.a('function');
    expect(Entity.whatever).to.be.a('function');
  });

  it('should proxy an entity method through the rest API', (done) => {
    Entity.doSomethingAsync('something', { another: 'thing' }, (err, firstRes, secondRes) => {
      if (err) return done(err);
      expect(firstRes).to.equal('Sweet');
      expect(secondRes).to.deepEqual({ nested: { thing: ['true', 'dat'] }});
    });
  });
});
