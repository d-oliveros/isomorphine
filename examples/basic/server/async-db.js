
// This file represents the database models.
// You can use any database and any library you want, because the browser
// never gets here. The browser, instead of requiring the database, is
// proxying the remote procedure calls


// This is to demostrate that you can require browser-incompatible modules
// in the API endpoints, without breaking the browser or bloating
// the bundled file.
let net = require('net'); // eslint-disable-line
let fs = require('fs'); // eslint-disable-line

// Eg.
// let mongoose = require('mongoose');

let state = {
  posts: {},
  users: {}
};

let models = {
  Post: {
    create(newPost, callback) {
      newPost.created = Date.now();
      state.posts[newPost.title] = newPost;

      console.log(`Post ${newPost.title} created.`);

      callback(null, newPost);
    }
  },

  User: {
    load(query, options, callback) {
      if (!state.users[query._id]) return callback();

      let user = state.users[query._id];
      let ret = {};

      options.select.forEach((select) => {
        ret[select] = user[select];
      });

      console.log(`Loaded user: ${user._id}`);

      callback(null, ret);
    },

    create(user, callback) {
      user.created = Date.now();
      state.users[user._id] = user;

      console.log(`User ${user._id} created.`);

      callback(null, user);
    }
  }
};

/**
 * Adds latency to every async callback method in each model.
 */
for (let entity in models) {
  for (let method in models[entity]) {
    models[entity][method] = fakeLatency(models[entity][method]);
  }
}

function fakeLatency(cb) {
  return setTimeout(cb, (Math.floor(Math.random() * 1000)));
}
