var path = require('path');
var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var isomorphine = require('../index');

var mocksPath = path.resolve(__dirname, 'mocks');

describe('Server', function() {
  describe('Factory', function() {

    it('should load all the modules in a folder', function() {
      var api = isomorphine.proxy(mocksPath);

      // Isomorphine exports
      expect(api).to.be.an('object');
      expect(api.router).to.be.a('function');

      // Methods that were required by isomorphine
      expect(api.aSingleMethod).to.be.an('function');

      // Support for es6 "export default"
      expect(api.NestedEntity).to.be.an('object')
        .with.property('aMethod').that.is.a('function');

      expect(api.Entity.doSomething()).to.equal('You got it');
    });

    it('should load all the modules in a folder without dir param', function() {
      var api = isomorphine.proxy();

      expect(api).to.be.a('object');

      expect(api.mocks).to.be.an('object')
        .with.property('map').that.is.an('object')
          .that.include.keys(['Entity', 'NestedEntity']);

      expect(api.mocks.NestedEntity).to.be.an('object')
        .with.property('ChildEntity').that.is.an('object')
          .that.include.keys(['childMethod']);
    });
  });

  describe('Router', function() {
    var app;

    before(function() {
      var api = isomorphine.proxy(mocksPath);
      app = express();

      app.use(api.router);
      app.use(function(err, req, res, next) { // eslint-disable-line
        res.sendStatus(err.statusCode || err.status || 500);
      });
    });

    it('should only accept post requests and return 404(express)', function(done) {
      request(app)
        .get('/isomorphine/Entity/doSomething')
        .expect(404)
        .end(done);
    });

    it('should call a server-side method and return OK', function(done) {
      request(app)
        .post('/isomorphine/aSingleMethod')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ values: [null] })
        .end(done);
    });

    it('should call a nested server-side method and return OK', function(done) {
      request(app)
        .post('/isomorphine/NestedEntity/ChildEntity/childMethod')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ values: [null] })
        .end(done);
    });

    it('should call a server-side entity and return nested results', function(done) {
      request(app)
        .post('/isomorphine/Entity/doSomethingAsync')
        .send({ payload: ['oneParam', 'anotherParam', '__clientCallback__'] })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ values: ['Sweet', { nested: { thing: ['true', 'dat'] }}]})
        .end(done);
    });

    it('should call a server-side entity and provide a context', function(done) {
      request(app)
        .post('/isomorphine/Entity/withContext')
        .send({ payload: ['__clientCallback__'] })
        .expect(200)
        .end(done);
    });

    it('should call a server-side entity and pass the validation', function(done) {
      request(app)
        .post('/isomorphine/Entity/withValidation')
        .send({ payload: ['thekey', '__clientCallback__'] })
        .expect(200)
        .end(done);
    });

    it('should call a server-side entity and fail the validation', function(done) {
      request(app)
        .post('/isomorphine/Entity/withValidation')
        .send({ payload: ['incorrectkey', '__clientCallback__'] })
        .expect(401)
        .end(done);
    });
  });
});
