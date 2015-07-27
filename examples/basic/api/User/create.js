import db from '../../server/async-db';

export default function create(user, callback) {

  // Do the DB query, etc
  console.log('Creating a new user...');

  db.User.create(user, callback);
}
