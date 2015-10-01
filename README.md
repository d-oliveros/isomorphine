# Isomorphine

Creates an isomorphic API proxy that lets you use your server's API endpoints as plain functions, without exposing your server's code or breaking/bloating your bundle.

Isomorphine lets you require your serverside's api endpoints ala CommonJS. When requiring the endpoints from the browser's context, the resolved modules will actually be proxied mirrors to the serverside entities, that when called, will create a HTTP request to the server's isomorphine endpoint.

When requiring the endpoints from the server's context, the endpoints will be resolved as they are, without generating any extra request or doing any unnecesary routing.


### Requirements
- Webpack (I'll get the browserify transform soon though...)

### Installation

```bash
npm install isomorphine
```

You also need to load the isomorphine loader in your webpack.config.js file:

```js
module.exports = {
  entry: {
    ...
  },
  output: {
    ...
  },
  module: {
    preLoaders: [
      {
        loaders: ['isomorphine']
      }
    ]
  },
  plugins: [
    ...
  ]
};
```


### Usage

* Check [this](https://github.com/d-oliveros/isomorphine/tree/master/examples/isomorphic-react) for a full example.

Lets say you have an api file structure that looks like this, with each method running database queries and business logic:

```
/api/index.js
/api/User/create.js
/api/User/delete.js
/api/Post/create.js
```

You can not directly require these files in the browser, as the browser doesn't have access to the database layer (and you don't want to pollute the bundled file).

With isomorphine, you can provide these modules in the browser (as proxy mirrors) by doing:

```js
// In /api/index.js

var isomorphine = require('isomorphine');

/**
 * Isomorphine will create an isomorphic API, using the file structure
 * of the current directory to map out the api's endpoints.
 */
module.exports = isomorphine.proxy(__dirname);
```

This will create an express-based router, that you can then use in your express-based app.

```js
// In /server/app.js

var express = require('express');
var app = express();

// Requires the isomorphic API created with 'isomorphine.proxy()'
var api = require('../api');

// Use the isomorphic API: Listen for isomorphine's remote procedure calls (RPCs)
app.use(api);
```

After doing that, you can call the API endpoints in the browser by doing, for example:

```js
// In /client/index.js

/**
 * We can interact with the API endpoint without doing any manual HTTP requests
 * because, well, that's what isomorphine does...
 */
var User = require('../api').User;

User.create({ title: 'Hi there!' }, 'whatever', function(err, user, anotherVal) {

  /**
   * When called from the browser, the browser serialized each parameter sent
   * to the function call, and sends the serialized payload via a HTTP request
   * to isomorphine's endpoint in the server.
   *
   * Isomorphine serializes the result of the function call in the server,
   * returns the resulting values, deserializes the values, and calls
   * this callback function with the resulting values.
   */
  console.log('Got back! User is: ', user);
});
```

Your modules will _not_ be exposed in the browser, nor they will get added to the bundled file.

You can use the api's endpoints from the server, using the same syntax and code than if you were in the browser, and viceversa.

```js
// In /server/index.js

/**
 * In the server, "User.create()" is called directly, without any routing or
 * serialization whatsoever, making it really convenient for
 * isomorphic applications, as you would be able to re-use your
 * data fetching logic in your app.
 */
var User = require('../api').User;

User.create({ title: 'Hi there!' }, 'whatever', function(err, user, anotherVal) {

  // Function called directly. No routing or serialization happened.
  console.log('Got back! User is: ', user);
});
```

Check [this](https://github.com/d-oliveros/isomorphine/tree/master/examples/isomorphic-react) for a full example app.


### RPC Context

Allowing any API endpoint to be called from the browsers needs a proper validation mechanism to avoid getting exploited easily.

When a call to an API endpoint is done from the browser, a special context is passed to the serverside function calls. The request object `req` and a special `xhr` flag are passed as the function's context. You can use this context to validate an incoming request:

```js
// In /api/User/delete.js

module.exports = function deleteUser(userId, callback) {

  /**
   * When an endpoint is called from the browser, 'this.xhr' will be true,
   * and you'll be able to access the request object in 'this.req'.
   */
  if (this.xhr && this.req.cookies.role !== 'admin') {

    // eg. Only allow admins to delete users
    return callback(new Error('Not admin.'));
  }

  // do the db query to delete the user...
  // User.delete(userId, callback)
}

```

Keep in mind, when an API endpoint is called from the server, there's no `req` object being passed to the function calls, so you must validate sensitive paths in an earlier stage.


### API

* `isomorphine.proxy(dir)` - Creates an isomorphic API using the base directory `dir` that will let you use your server's API endpoints as plain functions.


### Configuration

You need to tell the browser the host and port of your isomorphine router (The default is `localhost:3000`).

You can set those variables using webpack:

```js
var webpack = require('webpack');

module.exports = {
  entry: {
    ...
  },
  output: {
    ...
  },
  module: {
    preLoaders: [
      {
        loaders: ['isomorphine']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        ISOMORPHINE_HOST: '"myhost.com"',
        ISOMORPHINE_PORT: '"8000"'
      }
    })
  ]
};
```


### Test

```bash
mocha test
```

Cheers.
