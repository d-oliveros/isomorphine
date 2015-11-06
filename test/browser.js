var expect = require('chai').expect;
var path = require('path');
var isomorphine = require('../browser');
var Proxy = require('../src/client/proxy');
var apiFactory = require('../src/server/factory');
var config = require('../config');
var entityMock = require('./mocks/Entity');
var mapMock = require('./mocks/map');

describe('Browser', function() {
  describe('Factory', function() {
    it('should map the entity methods to proxy instances', function() {
      var api = isomorphine.proxy(mapMock);

      expect(api.Entity.constructor).to.equal(Proxy);
      expect(api.EmptyEntity.constructor).to.equal(Proxy);
      expect(api.Entity.doSomething).to.be.a('function');
      expect(api.Entity._host).to.be.a('string');
      expect(api.Entity._port).to.be.a('string');
    });

    it('should configure entities', function() {
      var api = isomorphine.proxy(mapMock);

      var newHost = 'http://127.0.0.1';
      var newPort = '6685';

      api.config({
        host: newHost,
        port: newPort
      });

      expect(api.Entity._host).to.equal(newHost);
      expect(api.Entity._port).to.equal(newPort);
    });
  });

  describe('Proxy', function() {
    it('should proxy an entity method through the rest API', function(done) {

      // Instanciates a new Proxy
      var Entity = new Proxy('Entity', entityMock);

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API in port 8888
      var server = api.router.listen(config.port, function(err) {
        if (err) return done(err);

        Entity.doSomethingAsync('something', { another: 'thing' }, function(err, firstRes, secondRes) {
          if (err) return done(err);
          expect(firstRes).to.equal('Sweet');
          expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
          server.close(done);
        });
      });
    });

    it('should proxy an entity method with overridden host and port', function(done) {
      var newHost = 'http://127.0.0.1';
      var newPort = 6685;

      // Instanciates a new Proxy
      var Entity = new Proxy('Entity', entityMock);

      // Override the entity's host and port
      Entity._host = newHost;
      Entity._port = newPort;

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API in port 6685
      var server = api.router.listen(newPort, function(err) {
        if (err) return done(err);

        Entity.doSomethingAsync('something', { another: 'thing' }, function(err, firstRes, secondRes) {
          if (err) return done(err);
          expect(firstRes).to.equal('Sweet');
          expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
          server.close(done);
        });
      });
    });
  });
});
