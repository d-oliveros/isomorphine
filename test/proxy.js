import {expect} from 'chai';
import isomorphic from '../src/morphic';
import api from '../src/api';
import entityMock from './mocks/entityMock';

describe('Client proxy', () => {
  let Entity;

  before((done) => {
    process.env.ISOMORPHIC_API_PORT = '8888';
    isomorphic.removeEntity('Entity');

    // Registers the isomorphic entity.
    isomorphic('Entity', entityMock);

    // We'll be testing the browser proxy as well, so we need to create a
    // entity as if we were in the browser's context.
    Entity = isomorphic('Entity', entityMock, { browser: true });

    api.listen(8888, done);
  });

  it('should proxy properties', () => {
    expect(Entity.doSomething).to.be.a('function');
    expect(Entity.whatever).to.be.a('function');
  });

  it('should proxy an entity method through the rest API', (done) => {
    Entity.doSomethingAsync('something', { another: 'thing' }, (err, firstRes, secondRes) => {
      if (err) return done(err);
      expect(firstRes).to.equal('Sweet');
      expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
      done();
    });
  });
});
