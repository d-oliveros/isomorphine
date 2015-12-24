import models from '../../server/models';

export default function loadUser(user, options, callback) {

  // Do the DB query, etc
  console.log('Loading a user...');

  models.User.load(user, options, callback);
}
