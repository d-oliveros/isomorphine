# Isomorphine

Isomorphine is a Webpack loader that lets you require and use server-side entities from the browser, as if you were in the server. _It does not expose server-side code._

You don’t need to do HTTP requests and endpoints anymore. You can skip the transport layer, and focus on your application's purpose.

### Requirements
- Webpack (I'll get the browserify transform soon though...)

### Installation

```bash
npm install isomorphine
```

You also need to [configure your webpack.config.js file](#webpack-configuration)


### Usage

Isomorphine has only one method: `isomorphine.proxy()`. This method behaves differently when being called from the server and the browser.

```js
var isomorphine = require('isomorphine');
module.exports = isomorphine.proxy();
```
In the server, `isomorphine.proxy()` requires all the modules in the current directory, and creates an express router listening to remote procedure calls (RPCs) on those methods.

In the browser, `isomorphine.proxy()` scans the file structure of your modules in the current directory via the webpack loader, and returns an object with a mirror of all the entities mapped to RPCs. You can use these functions the same way as you would use the functions in the server.


### How It Works

* Check [this](https://github.com/d-oliveros/isomorphine/tree/master/examples/isomorphic-react) for a full example.

Isomorphine lets you build isomorphic APIs that can be used the same way in the browser and the server. The browser accesses a proxy of the server’s methods that are being required. The proxy is a mirror of the server-side entity. The proxy creates an HTTP request to Isomorphine’s endpoint (in the server).

If the server (as opposed to the browser) is requiring the functions, Isomorphine will be smart, it will not create a proxy or do any extra routing.

Lets say your server's models file structure looks like this. Each method is running database queries and business logic:

```
/models/index.js
/models/User/create.js
/models/User/delete.js
/models/Post/create.js
```

You can not directly require these files in the browser, as the browser doesn't have access to the database layer (and you don't want to pollute the bundled file).

With isomorphine, you can provide these modules in the browser (as proxy mirrors) by doing:

```js
// In /models/index.js

var isomorphine = require('isomorphine');

/**
 * Isomorphine will create an isomorphic API, using the file structure
 * of the current directory to map out the API's endpoints.
 *
 * This API will behave differently when required from the server and the browser.
 */
module.exports = isomorphine.proxy();
```

In the server, this will create an express-based router, that you can then connect in your express-based app:

```js
// In /server/app.js

var express = require('express');
var app = express();

// Requires the isomorphic API created with 'isomorphine.proxy()'
var modelsAPI = require('../models');

// Use the isomorphic API: Listen for isomorphine's remote procedure calls (RPCs)
app.use(modelsAPI.router);
```

After connecting the router, you can call the models in the browser by doing this, for example:

```js
// In /client/index.js

/**
 * We can interact with the models without having to do any manual HTTP requests
 * because, well, that's what isomorphine does...
 */
var User = require('../models').User;

/**
 * When called from the browser, the browser serialized each parameter sent
 * to the function call, and sends the serialized payload via a HTTP request
 * to isomorphine's endpoint in the server.
 *
 * Isomorphine serializes the result of the function call in the server,
 * returns the resulting values, deserializes the values, and calls
 * this callback function with the resulting values.
 */
User.create({ title: 'Hi there!' }, 'whatever', function(err, user, anotherVal) {
  console.log('Got back! User is: ', user);
});
```

**Your models will _not_ be exposed in the browser, nor they will get added to the bundled file.**

You can access the models from the server, using the same syntax and code that you would use as if you were in the browser, and vice versa.`

```js
// In /server/index.js

/**
 * In the server, "User.create()" is called directly, without any routing or
 * serialization whatsoever, making it really convenient for
 * isomorphic applications, as you would be able to re-use your
 * data fetching logic in your app.
 */
var User = require('../models').User;

User.create({ title: 'Hi there!' }, 'whatever', function(err, user, anotherVal) {
  console.log('Function called directly. No routing or serialization happened.');
});
```

Check [this](https://github.com/d-oliveros/isomorphine/tree/master/examples/isomorphic-react) for an isomorphic react example app.


### RPC Context

Allowing any API endpoint to be called from the browser, needs a proper validation mechanism to avoid getting exploited easily.

When a call to a server-side function is done from the browser, a special context is passed to the function call. The request object `req` and a special `xhr` flag are passed as the function's context. You can use this context to validate incoming requests:

```js
// In /models/User/delete.js

/**
 * When an endpoint is called from the browser, 'this.xhr' will be true,
 * and you'll be able to access the request object in 'this.req'.
 */
module.exports = function deleteUser(userId, callback) {
  if (this.xhr && this.req.cookies.role !== 'admin') { // Validate using `req`
    return callback(401);
  }

  // do the db query to delete the user...
  // this.delete(userId, callback)
}

```

Keep in mind, when a function is called from the server, there's no `req` object being passed to the function calls, so you must validate sensitive paths in an earlier stage.


### Webpack Configuration

In order for isomorphine to work, you need to specify isomorphine as a webpack loader in your webpack.config.js file:

```js
module.exports = {
  entry: {...},

  module: {
    preLoaders: [{ loaders: ['isomorphine'] }]
  },
  ...
};
```

Isomorphine needs to know the host and port of your server. The default configuration is

```
{
  "host": "http://localhost",
  "port": 3000
}
```

You can configure Isomorphine's server host through Webpack:

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
        ISOMORPHINE_HOST: '"http://myhost.com"',
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
