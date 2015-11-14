var expect = require('chai').expect;
var path = require('path');
var isomorphine = require('../browser');
var createProxiedMethod = require('../src/client/createProxiedMethod');
var apiFactory = require('../src/server/factory');
var mapMock = require('./mocks/map');

describe('Browser', function() {
  describe('Factory', function() {
    it('should map the entity methods to proxy instances', function() {
      var api = isomorphine.proxy(mapMock);

      expect(api.index).to.not.be.a('function');
      expect(api.aSingleMethod).to.be.a('function');
      expect(api.Entity.doSomething).to.be.a('function');
      expect(api.NestedEntity.ChildEntity.childMethod).to.be.a('function');
    });
  });

  describe('Proxied Methods', function() {
    it('should proxy an entity method through the rest API', function(done) {

      var config = {
        host: 'http://127.0.0.1',
        port: 3000
      };

      var methodPath = 'Entity/doSomethingAsync';

      // Instanciates a new Proxy
      var proxiedMethod = createProxiedMethod(config, methodPath);

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API server
      var server = api.router.listen(3000, function(err) {
        if (err) return done(err);

        proxiedMethod('something', { another: 'thing' }, function(err, firstRes, secondRes) {
          if (err) return done(err);
          expect(firstRes).to.equal('Sweet');
          expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
          server.close(done);
        });
      });
    });

    it('should proxy an entity method with overridden host and port', function(done) {
      var clientApi = isomorphine.proxy(mapMock);

      var config = {
        host: 'http://127.0.0.1',
        port: 6689
      };

      clientApi.config(config);

      // Creates a new API to listen to the clientside proxied function calls
      // In a real-world example, clientApi and serverApi will be the same code,
      // reused in an isomorphic fashion.
      var serverApi = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API in port 6689
      var server = serverApi.router.listen(6689, function(err) {
        if (err) return done(err);

        clientApi.Entity.doSomethingAsync('something', { another: 'thing' }, function(err, firstRes, secondRes) {
          if (err) return done(err);
          expect(firstRes).to.equal('Sweet');
          expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
          server.close(done);
        });
      });
    });

    it('should return a promise if no callback is provided', function(done) {
      var methodPath = 'Entity/returnPromise';

      var config = {
        host: 'http://127.0.0.1',
        port: 3000
      };

      // Instanciates a new Proxy
      var proxiedMethod = createProxiedMethod(config, methodPath);

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API server
      var server = api.router.listen(3000, function(err) {
        if (err) return done(err);

        proxiedMethod('something', { another: 'thing' })
        .then(function(value) {
          expect(value).to.equal('Cool');
          server.close(done);
        })
        .catch(done);
      });
    });

    it('should resolve a value when entity returns a raw value', function(done) {
      var methodPath = 'Entity/returnValue';

      var config = {
        host: 'http://127.0.0.1',
        port: 3000
      };

      // Instanciates a new Proxy
      var proxiedMethod = createProxiedMethod(config, methodPath);

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API server
      var server = api.router.listen(3000, function(err) {
        if (err) return done(err);

        proxiedMethod()
        .then(function(value) {
          expect(value).to.equal('Sync value');
          server.close(done);
        })
        .catch(done);
      });
    });
  });
});
