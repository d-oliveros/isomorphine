# Isomorphine

Isomorphine lets you use server-side entities from the browser, as if you were in the server. It does _not_ expose server-side code.

You don’t need to do HTTP requests and endpoints anymore. You can skip the transport layer, and focus on your application's purpose.

### Summary

* [Installation](#installation)
* [Usage](#usage)
* [How It Works](#how-it-works)
* [Promise & Async/Await](#promise--es6-support)
* [RPC Context](#rpc-context)
* [Examples](#examples)
* [Caveats](#caveats)
* [Philosophy](#philosophy)


### Requirements
- Node
- Webpack

### Installation

```bash
npm install isomorphine
```

### Usage

```js
var isomorphine = require('isomorphine');

// Creates an isomorphic entity proxy with browser and server support.
// This will let you call serverside methods in the browser,
// without requiring the files contained in those modules.
var morphine = isomorphine.proxy();

// Sets the API host endpoint configuration in the browser.
morphine.config({
  host: '127.0.0.1', // your http server's host. default: '127.0.0.1'
  port: '3000'       // your http server's port. default: '3000'
});

module.exports = morphine;
```

Then you just have to mount the newly created proxy in your express-based app:

```js
var express = require('express');
var morphine = require('./api'); // suppose this is the file we defined above

var app = express();

app.use(morphine.router);

app.listen(3000, function() {
  console.log('Server listening at port 3000');
});
```

Basically you just need to:

1. Create an isomorphic proxy
2. Mount the proxy in your app
3. [configure your webpack.config.js file](#webpack-configuration)


### How It Works

Isomorphine lets you build isomorphic APIs that can be used the same way in the browser and the server. The browser accesses a proxy of the server’s methods that are being required. The proxy is a mirror of the server-side entity. The proxy creates an HTTP request to Isomorphine’s endpoint (in the server).

If the server (as opposed to the browser) is requiring the functions, Isomorphine will be smart, it will not create a proxy or do any extra routing.

* Check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone), and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for full examples.

Suppose the following structure:

```
/api/index.js
/api/User/create.js
/api/User/delete.js
/app.js
/client.js
```

Imagine you have a serverside model named `MyUserModel`, and an api with two methods (aka two routes): `create` and `delete`:

```js
// eg. in /api/User/create.js
module.exports = function createUser(user, callback) {
  MyUserModel.create(user, function(err, newUser) {
    if (err) return callback(err);
    console.log('User created');
    callback(null, newUser);
  });
}
```

```js
// eg. in /api/User/delete.js
module.exports = function deleteUser(uid, callback) {
  MyUserModel.remove({ _id: uid }, callback);
}
```

To require serverside entities from the browser:

```js
// in /api/index.js

var isomorphine = require('isomorphine');

/**
 * In the server, `isomorphine.proxy()` requires all the files
 * in the current directory, and creates an express router listening to
 * remote procedure calls (RPCs) on those methods. It scans the files recursively,
 * and also includes files inside folders in the current directory.
 *
 * Optionally, you can pass the absolute path to the directory you want to proxy.
 *
 * In the browser, Webpack scrans the file structure of the current directory,
 * and transforms it to an entity map. Each property in the map represents a route
 * to an entity in the server. An entity is a module (a js file) exporting a function
 * via 'module.exports' or 'export default'.
 *
 * `isomorphine.proxy()` returns a map of all the entities mapped to RPCs.
 * These modules are _not_ required nor exposed in the browser.
 */
var morphine = isomorphine.proxy();

module.exports = morphine;
```

When this file is required in the server, it will create a connect/express-based router, that you can then connect in your app:

```js
// in /app.js
var express = require('express');
var morphine = require('./api'); // suppose this is the file we defined above

var app = express();

app.use(morphine.router);

// you can mount other middleware and routes in the same app
// app.get('/login', mySecureLoginCtrl);

app.listen(3000, function() {
  console.log('Server listening at port 3000');
});
```

After connecting the router, you can call the api endpoints in the browser by doing this, for example:

```js
// eg. in /client.js
var User = require('../api').User;

/**
 * We can interact with the API without having to do any manual HTTP requests.
 *
 * When called from the browser, the browser serialized each parameter sent
 * to the function call, and sends the serialized payload via a HTTP request
 * to Isomorphine's endpoint in the server.
 *
 * Isomorphine serializes the result of the function call in the server,
 * returns the resulting values, deserializes the values, and calls
 * this callback function with the resulting values.
 */
User.create({
  name:     'Im not in the server',
  headline: 'but I can still use server-side modules as if I were in the server',
}, function(err, user) { // using callback-based serverside entities

  window.alert('User created');

  User.delete(user._id, function(err) {
    window.alert('User deleted');
  });
});
```

**Your models will _not_ be exposed in the browser, nor they will get added to the bundled file.**

It also supports promises and ES6 async/await

```js
// eg. in /client.js
import { User } from '../api';

const user = await User.create({
  name:     'Im not in the server',
  headline: 'but I can still use server-side modules as if I were in the server',
});

window.alert('User created');

await User.delete(user._id); // using promise-based serverside entities

window.alert('User deleted');

// multiple arguments are supported.
// You can define and use functions as you would normally do
User.edit(user._id, { name: 'newName' }, () => {
  console.log('User edited');
});
```

You can access the models from the server, using the same syntax and code that you would use as if you were in the browser, and vice versa.

This is specially handy for truly isomorphic applications, where you need the same piece of code running un the browser and the server, for example when rendering a react application on server-side.

```js
import { User as UserAPI } from '../api';

// In the browser, 'User.get()' will make a HTTP request to the server,
// run `User.get(123)` in the server, return the results to the browser,
// and resolve the promise with the value(s).
//
// In the server, 'User.get()' will be called directly,
// without any HTTP requests or else, making it really convenient for
// isomorphic applications, as you would be able to re-use your
// data fetching logic in your app.
export default class MyComponent extends React.Component {
  componentDidMount() {
    User.get(123).then((user) => {
      this.setState({ user: user });
    });
  }
}
```

Remember to check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone), and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for full examples.


### Promise / ES6 Support

Isomorphine supports promises, async/await, and callback-based functions.

```
// eg. in /models/User/create.js

// Promise support
module.exports = function getUser() {
  return MyUserModel.findAsync({ _id: 123 }); // supposing this returns a promise
}

// Another example
module.exports = function getUser() {
  return new Promise((resolve, reject) => {
    fs.readFile('somefile.txt', function(err, file) {
      if (err) return reject(err);
      resolve(file);
    });
  });
}
```

```
// eg. in /models/User/create.js

// ES6 async/await support
export default async function getUser() {
  const user = await MyUserModel.find({ _id: 123 });

  // await doMoreStuff()...

  return user;
}
```

```
// eg. in /models/User/create.js

// callback-based support
module.exports = function getUser(uid, callback) {
  MyUserModel.find({ _id: uid }, (err, user) => {
    if (err) return callback(err);

    console.log('Got a user!');

    callback(null, user);
  });
}
```


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


### Examples

Check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone) for a crude example, and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for a full isomorphic react example.

Also go to [Wiselike](https://wiselike.com) to see it running in a production environment, and [ask me anything here!](https://wiselike.com/david)


### Caveats

* Your modules have to be required through the isomorphine proxy. You can not require a serverside entity directly. If you do, you will be importing all the serverside code to the browser's bundle, and possibly breaking your app due to browser-incompatible modules, like `fs`, `express`, `mongo`, database drivers, etc.

* When a function is called directly from the server (eg when called by a cron job), there's no `this.req` object being passed to the function calls, so you must validate sensitive paths in an earlier stage.

* Also, please note that the file where you decide to create the isomorphic proxy has to be browser-compatible. Isomorphine works by proxying the methods contained in the specified directory, but the file itself will be required as-is in the browser.


### Philosophy

Isomorphine lets you abstract the transport layer in a non-obtrusive way, and change how you program web-based distributed applications. It is meant to increase code reusability between the server and the browser, specially in a full-stack javascript environment.

The idea is to encapsulate the transport layer within javascript's native syntax for importing and exporting modules, while providing a middleware interface to let you mount its API the way you want. This massively reduce development times, as you don't have to worry about the routing layer, and focus on your application's purpose.

Isomorphine proposes an 'endpoint-less' approach, trying to abstract the barriers between a server and the browser's context.


### Tests

```bash
mocha test
```

Cheers.
