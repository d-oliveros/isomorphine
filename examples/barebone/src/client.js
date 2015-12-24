var api = require('./api');
var User = api.User;
var Post = api.Post;

// Isomorphine is framework-agnostic, so you can use any framework you want
// React, Angular, Backbone, Ember, etc...

/**
 * Loads or creates a user, when clicking the load user button.
 */
$('#load-user').on('click', function() {
  var username = $('#username').val();

  if (!username) {
    return alert('Please specify a username to load');
  }

  log('Calling isomorphic method: User.load');
  User.load({ name: username }, { select: ['name'] }, function(err, user) {
    if (err) return console.error(err);

    if (user) {
      return log('User found: ' + user.name);
    }

    log('User "' + username + '" not found. Creating a new user');
    log('Calling isomorphic method: User.create');

    User.create({ name: username }, function(err, user) {
      if (err) return console.error(err);

      log('User created: ' + user.name);
    });
  });
});

/**
 * Creates a new post, when clicking the create post button.
 */
$('#create-post').on('click', function() {
  var title = $('#post-title').val();

  if (!title) {
    return alert('Please specify the post\'s title');
  }

  log('Calling isomorphic method: Post.create');
  Post.create(title, function(err, post) {
    if (err) return console.error(err);
    log('Created post ' + post._id + ' - "' + post.title + '"');
  });
});

function log(msg) {
  console.log(msg);
  $('#console').append(msg + '\n');
}
