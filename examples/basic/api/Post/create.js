let db = require('../../server/async-db');

export default function createPost(newPost, callback) {

  // Do the DB query, etc
  console.log('Creating a new post...', db);

  db.Post.create(newPost, callback);
}
