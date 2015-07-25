var request = require('supertest');
var isomorphine = require('../src/isomorphine');
var api = require('../src/api');
var entityMock = require('./mocks/entityMock');

describe('API', function() {
  before(function() {
    isomorphine.resetEntities();
    isomorphine.registerEntity('Entity', entityMock);
  });

  it('should call a server-side entity and return OK', function(done) {
    request(api)
      .get('/Entity/doSomething')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ values: ['Ok'] })
      .end(done);
  });

  it('should call a server-side entity and return nested results', function(done) {
    request(api)
      .post('/Entity/doSomethingAsync')
      .send({ payload: ['oneParam', 'anotherParam', '__clientCallback__'] })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ values: ['Sweet', { nested: { thing: ['true', 'dat'] }}]})
      .end(done);
  });
});
