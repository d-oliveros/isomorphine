var db = require('../../db');

module.exports = function createUser(user, callback) {

  // Do the DB query, etc
  console.log('Creating a new user...');

  db.User.create(user, callback);
}
