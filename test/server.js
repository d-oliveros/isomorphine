var path = require('path');
var request = require('supertest');
var isomorphine = require('../index');
var createApi = require('./util/create-api');
var entityMock = require('./mocks/entity');
var expect = require('chai').expect;

describe('Serverside', function() {
  describe('API', function() {

    it('should load all the modules in a folder', function() {
      var apiRoot = path.resolve(__dirname, 'mocks');

      var api = isomorphine.inject(apiRoot);

      expect(api).to.be.an('object');
      expect(Object.keys(api).length).to.equal(2);
      expect(api.OneEntity).to.be.an('object')
        .with.property('method').that.is.a('function');

      expect(api.OneEntity.method()).to.equal('You got it');
    });
  });

  describe('Router', function() {
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

    it('should run the middleware defined in the server-side entity', function(done) {
      request(api)
        .post('/isomorphine/Entity/doSomethingAsync')
        .send({ payload: ['Prohibited value', null, '__clientCallback__'] })
        .expect(401)
        .end(done);
    });
  });
});
