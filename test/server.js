var path = require('path');
var request = require('supertest');
var express = require('express');
var isomorphine = require('../index');
var router = require('../lib/router');
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
    var app;

    before(function() {
      app = express();

      app.use(router);
      app.use(function(err, req, res, next) { // eslint-disable-line
        res.sendStatus(err.statusCode || err.status || 500);
      });

      isomorphine.resetEntities();
      isomorphine.registerEntity('Entity', entityMock);
    });

    it('should call a server-side entity and return OK', function(done) {
      request(app)
        .get('/isomorphine/Entity/doSomething')
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

    describe('Validation', function() {
      it('should run the middleware defined in the server-side entity', function(done) {
        request(app)
          .post('/isomorphine/Entity/doSomethingAsync')
          .send({ payload: ['Prohibited value', null, '__clientCallback__'] })
          .expect(401)
          .end(done);
      });

      it('should run the validation function and be OK', function(done) {
        request(app)
          .post('/isomorphine/Entity/withValidation')
          .send({ payload: ['expected-param'] })
          .expect(200)
          .end(done);
      });

      it('should run the validation function and break', function(done) {
        request(app)
          .post('/isomorphine/Entity/withValidation')
          .send({ payload: ['incorrect-param'] })
          .expect(401)
          .end(done);
      });

      it('should run a promise-based validation function', function(done) {
        request(app)
          .post('/isomorphine/Entity/withPromiseValidation')
          .send({ payload: ['expected-param'] })
          .expect(200)
          .end(done);
      });

      it('should run a promise-based validation and break', function(done) {
        request(app)
          .post('/isomorphine/Entity/withPromiseValidation')
          .expect(408)
          .end(done);
      });

      it('should fail the validation with error status code', function(done) {
        request(app)
          .post('/isomorphine/Entity/withError')
          .expect(503)
          .end(done);
      });
    });
  });
});
