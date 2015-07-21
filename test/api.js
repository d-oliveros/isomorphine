import isomorphic from '../src/isomorphic';
import api from '../src/api';
import request from 'supertest';

describe('API', () => {
  let Entity = {
    doSomething() {
      return 'did something.';
    },
    doSomethingAsync(firstParam, secondParam, callback) {
      setTimeout(() => {
        callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
      }, 300);
    }
  };

  before(() => {
    isomorphic.removeEntity('Entity');
    Entity = isomorphic('Entity', Entity);
  });

  it('should call a server-side entity and return OK', (done) => {
    request(api)
      .get('/Entity/doSomething')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(['Ok'])
      .end(done);
  });

  it('should call a server-side entity and return nested results', (done) => {
    request(api)
      .post('/Entity/doSomethingAsync')
      .send({ args: ['oneParam', 'anotherParam', '__clientCallback__'] })
      .expect(200)
      .expect(['Sweet', { nested: { thing: ['true', 'dat'] }} ])
      .end(done);
  });
});
