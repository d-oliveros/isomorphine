var gutil = require('gulp-util');
var nodemon = require('nodemon');

module.exports = function() {
  var mon = nodemon({
    script: 'index.js',
    ext: 'js,jsx',
    ignore: ['node_modules']
  });

  mon.on('log', function(log) {
    if (log.type === 'status') {
      gutil.log(log.message);
    }

    if (log.message.indexOf('change') > -1) {
      nodemon.emit('change');
    }
  });

  process.on('exit', mon.emit.bind(mon, 'exit'));
};
