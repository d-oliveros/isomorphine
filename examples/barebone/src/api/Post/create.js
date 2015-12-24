var db = require('../../db');

module.exports = function createPost(newPost, callback) {

  // Do the DB query, etc
  console.log('Creating a new post...');

  db.Post.create(newPost, callback);
}
