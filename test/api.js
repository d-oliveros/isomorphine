import request from 'supertest';
import isomorphic from '../src/isomorphic';
import api from '../src/api';
import entityMock from './mocks/entityMock';

describe('API', () => {
  before(() => {
    isomorphic.removeEntity('Entity');
    isomorphic('Entity', entityMock);
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
