var expect = require('chai').expect;
var path = require('path');
var isomorphine = require('../index-browser');
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
    });
  });

  describe('Proxy', function() {
    var Entity, server;

    before(function(done) {

      // Instanciates a new Proxy
      Entity = new Proxy('Entity', entityMock);

      // Creates a new API to listen to the clientside proxied function calls
      var api = apiFactory(path.join(__dirname, 'mocks'));

      // Starts the test's API in port 8888
      server = api.listen(config.port, done);
    });

    it('should proxy an entity method through the rest API', function(done) {
      Entity.doSomethingAsync('something', { another: 'thing' }, function(err, firstRes, secondRes) {
        if (err) return done(err);
        expect(firstRes).to.equal('Sweet');
        expect(secondRes).to.deep.equal({ nested: { thing: ['true', 'dat'] }});
        done();
      });
    });

    after(function(done) {
      server.close(done);
    });
  });
});
