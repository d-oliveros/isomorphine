var fs = require('fs');
var path = require('path');
var loader = require('../lib/webpack-loader');
var expect = require('chai').expect;

describe('Webpack Loader', function() {
  var source;
  var sourcePath = path.resolve(__dirname, './mocks/index.js');

  var webpackContext = {
    context: path.dirname(sourcePath)
  };

  before(function(done) {
    fs.readFile(sourcePath, { encoding: 'utf8' }, function(err, file) {
      if (err) return done(err);
      source = file;
      done();
    });
  });

  it('should correctly transform a file', function() {
    expect(source.indexOf('isomorphine.api(__dirname)')).to.be.gt(-1);

    var result = loader.call(webpackContext, source);

    expect(result).to.be.a('string');
    expect(result.indexOf('isomorphine.api(__dirname)')).to.be.lt(0);
    expect(result.indexOf('isomorphine.api(null, __entityMap)')).to.be.gt(-1);
    expect(result.indexOf('function __isomorphicAPIFactory() {')).to.be.gt(-1);
  });
});
