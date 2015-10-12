import models from '../../server/models';

export default function createPost(newPost, callback) {

  // Do the DB query, etc
  console.log('Creating a new post...');

  models.Post.create(newPost, callback);
}
