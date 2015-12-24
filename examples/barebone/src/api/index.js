var isomorphine = require('isomorphine');

// This will provide the entities in this folder,
// similar to 'require-all' but in a browser-compatible way
var morphine = isomorphine.proxy();

// You need to tell isomorphine where your host is. These are the defaults
morphine.config({
  host: '127.0.0.1',
  port: '3000'
});

// You should require this file directly from the browser,
// as it will let you use server-side modules located in this folder remotely.
module.exports = morphine;
