var db = require('../../db');

module.exports = function loadUser(user, options, callback) {

  // Do the DB query, etc
  console.log('Loading a user...');

  db.User.load(user, options, callback);
}
