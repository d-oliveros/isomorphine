var request = require('supertest');
var isomorphine = require('../index');
var createApi = require('./util/create-api');
var entityMock = require('./mocks/entity');

describe('API', function() {
  var api = createApi();

  before(function() {
    isomorphine.resetEntities();
    isomorphine.registerEntity('Entity', entityMock);
  });

  it('should call a server-side entity and return OK', function(done) {
    request(api)
      .get('/isomorphine/Entity/doSomething')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ values: ['Ok'] })
      .end(done);
  });

  it('should call a server-side entity and return nested results', function(done) {
    request(api)
      .post('/isomorphine/Entity/doSomethingAsync')
      .send({ payload: ['oneParam', 'anotherParam', '__clientCallback__'] })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ values: ['Sweet', { nested: { thing: ['true', 'dat'] }}]})
      .end(done);
  });
});
