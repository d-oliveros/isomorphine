var nodemon = require('gulp-nodemon');

module.exports = function() {
  nodemon({
    script: 'index.js',
    ext: 'js,jsx',
    ignore: ['node_modules']
  });
};
