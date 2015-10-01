import models from '../../server/models';

export default function create(user, callback) {

  // Do the DB query, etc
  console.log('Creating a new user...');

  models.User.create(user, callback);
}
