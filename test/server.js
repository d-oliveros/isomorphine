var path = require('path');
var request = require('supertest');
var express = require('express');
var isomorphine = require('../index');
var expect = require('chai').expect;

var mocksPath = path.resolve(__dirname, 'mocks');

describe('Server', function() {
  describe('API', function() {

    it('should load all the modules in a folder', function() {
      var api = isomorphine.proxy(mocksPath);

      expect(api).to.be.a('function');
      expect(api.Entity).to.be.an('object')
        .with.property('doSomething').that.is.a('function');

      expect(api.Entity.doSomething()).to.equal('You got it');
    });
  });

  describe('Router', function() {
    var app;

    before(function() {
      var api = isomorphine.proxy(mocksPath);
      app = express();

      app.use(api);
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

    it('should call a server-side entity and return OK', function(done) {
      request(app)
        .post('/isomorphine/Entity/doSomething')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ values: ['Ok'] })
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
