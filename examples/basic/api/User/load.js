import db from '../../server/async-db';

export default function loadUser(user, options, callback) {

  // Do the DB query, etc
  console.log('Loading a user...');

  db.User.load(user, options, callback);
}
