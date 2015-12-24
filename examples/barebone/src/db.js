
// This file represents the database models.
// I mocked up some dummy models for demostration purposes only.

/**
 * You can use any database and any library you want, because the browser
 * never gets here. The browser, instead of requiring the database, is
 * proxying remote procedure calls to the server.
 *
 * This is to demostrate that you can require browser-incompatible modules
 * in the API endpoints, without breaking the browser or bloating
 * the bundled file.
 */
var net = require('net'); // eslint-disable-line
var fs = require('fs'); // eslint-disable-line

// Eg.
// var mongoose = require('mongoose');
// module.exports = mongoose.model('Model', modelSchema); etc...

var databaseState = {
  posts: {},
  users: {}
};

// Dummy models...
var models = {
  Post: {
    create: function(postTitle, callback) {
      var newPost = {
        _id: Math.floor(Math.random() * 1000),
        title: postTitle,
        created: Date.now()
      };

      databaseState.posts[newPost._id] = newPost;

      console.log('Post "' + newPost.title + '" created');

      callback(null, newPost);
    }
  },

  User: {
    load: function(query, options, callback) {
      if (!databaseState.users[query.name]) return callback();

      var user = databaseState.users[query.name];
      var ret = {};

      options.select.forEach(function(select) {
        ret[select] = user[select];
      });

      console.log('Loaded user: ' + user.name);

      callback(null, ret);
    },

    create: function(user, callback) {
      user.created = Date.now();
      databaseState.users[user.name] = user;

      console.log('User "' + user.name + '" created.');

      callback(null, user);
    }
  }
};

/**
 * Adds latency to every async callback method in each model.
 */
for (var entity in models) {
  for (var method in models[entity]) {
    models[entity][method] = fakeLatency(models[entity][method]);
  }
}

function fakeLatency(cb) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var delay = 50;
    var self = this;

    setTimeout(function() {
      cb.apply(self, args);
    }, delay);
  };
}

module.exports = models;
