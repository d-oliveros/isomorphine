var path = require('path');
var isomorphine = require('../src/isomorphine');
var expect = require('chai').expect;

describe('Isomorphine', function() {

  it('should load all the modules in a folder', function() {
    var entities = isomorphine.loadEntities(path.resolve(__dirname, 'mocks'));

    expect(entities).to.be.an('object');
    expect(Object.keys(entities).length).to.equal(2);
    expect(entities.OneEntity).to.be.an('object')
      .with.property('method').that.is.a('function');
  });
});
