var expect = require('chai').expect;
var isomorphine = require('../src/isomorphine');
var createApi = require('./util/create-api');
var entityMock = require('./mocks/entity');

describe('Client proxy', function() {
  var Entity, server, previousConf;
  var api = createApi();

  before(function(done) {
    previousConf = isomorphine.config();
    isomorphine.config({ port: '8888' });

    isomorphine.resetEntities();

    // Registers the isomorphine entity.
    isomorphine.registerEntity('Entity', entityMock);

    // We'll be testing the browser proxy as well, so we need to create a
    // entity as if we were in the browser's context.
    Entity = isomorphine.Proxy('Entity', entityMock);

    server = api.listen(8888, done);
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
    isomorphine.config(previousConf);
    server.close(done);
  });
});
