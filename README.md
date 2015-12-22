# Isomorphine

Isomorphine is a webpack loader that lets you access server-side modules in the browser, by abstracting the execution context of your modules.

When accessing a server-side module from the browser, the module is provided as a mirror of the server-side entity. This mirror will automatically transport any method call to the server, abstracting the routing layer for you. When accessing a module from the server's execution context, the module is resolved as-is, without any mirroring or routing whatsover. The server-side code will _not_ be required in the browser, thus making browser-incompatible entities usable in the browser.

This lets you share and use server-side code in the browser (for example your database models) and eliminate data fetching boilerplate. It does _not_ expose server-side code. It also provides a [security mechanism](#rpc-context) for remote procedure calls (RPCs), and support promise-based server-side entities.

You don’t need to do HTTP requests and endpoints anymore. You can skip the transport layer, and focus on your application's purpose.


### Summary

* [Usage](#installation)
* [How It Works](#how-it-works)
* [Promise support](#promise--es6-support)
* [Async/Await support](#promise--es6-support)
* [Security](#rpc-context)
* [Examples](#examples)
* [Comparison](#comparison)
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

Isomprhine has only one method: `isomorphine.proxy()`.

`isomorphine.proxy()` - Creates an object exposing the modules in the directory where it was called. Similar to [require-all](https://github.com/felixge/node-require-all), but also makes each module browser-compatible. Browsers can require server-side entities through this proxy object.

```js
var isomorphine = require('isomorphine');

// This will provide the entities in this folder similar to require-all,
// in a browser-compatible way
var morphine = isomorphine.proxy();

// You need to manually tell isomorphine where your host is
morphine.config({
  host: '127.0.0.1', // default: '127.0.0.1'
  port: '3000'       // default: '3000'
});

// You can require this file directly from the browser,
// and it will let you use server-side entities remotely.
module.exports = morphine;
```

After creating this isomorphic entity proxy, you just have to mount it in your connect/express based app:

```js
// This file is not browser-compatible. It represents your main app server.
var express = require('express');

// suppose the file we defined above is in ./models/index.js
var morphine = require('./models');

var app = express();

app.use(morphine.router);

app.listen(3000, function() {
  console.log('Server listening at port 3000');
});
```

And that's it! Now you can use any server-side entity through the object created with `isomorphine.proxy()`. Just require this `morphine` object from the browser or the server, and take anything you need out of it. For example:

```js
// The API surface of 'User' will be the same in the server and the browser,
// so this should work flawlessly regarding who is running this file.
var User = require('./models').User;

$('#button').on('click', function() {

  // When called from the browser, isomorphine will transport this function call
  // to the server, process the results, and resolve this callback function
  User.create({ name: 'someone' }, function(err, user) {
    console.log('Im the browser, and I created a user in the db!');
  });
});
```

You also need to [add isomorphine as a webpack loader](#webpack-configuration). Remember to read the [caveats](#caveats) for common gotchas.


### How It Works

* Check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone), and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for full examples.

Isomorphine detects server-side entities by scanning the file structure, and building objects whose methods represent files in the server. Each file has to export a function (via `module.exports` or `export default`). Read the [caveats](#caveats) for common gotchas.

The internal behavior of `isomorphine.proxy()` differs depending on whether its being ran in the browser or the server:

* When called from the server: `isomorphine.proxy()` requires all files in the current directory (similar to [require-all](https://github.com/felixge/node-require-all)) and also creates an express-based router that will handle remote procedure calls (RPCs) to the methods in these entities.

* When called from the browser: `isomorphine.proxy()` creates a mirror to the server-side entities. The mirror is preprocessed and injected by webpack, so you must [add isomorphine as a webpack loader](#webpack-configuration). No router is created in the browser, and no server-side modules are actually `require()`'d in the browser.

In this example, we will be using a fictitious server-side model called `User`. We will be splitting each model method in its own file.

```js
// in /models/User/create.js

module.exports = function createUser(username, callback) {
  var user = {
    _id: 123,
    type: 'user',
    name: username,
    created: new Date()
  };

  // It doesn't matter how you handle your data layer.
  // Isomorphine is framework-agnostic, so you can use anything you want, like
  // mongoose, sequelize, direct db drivers, or whatever really.
  db.create(user, callback);
}
```

```js
// in /models/User/delete.js

module.exports = function deleteUser(userId, callback) {
  db.remove({ _id: userId }, callback);
}
```

To make the these functions available in the browser, you have to create an isomorphic proxy to this folder by using `isomorphine.proxy()`.

`isomorphine.proxy()` will make these modules available in the browser, without breaking your bundle due to incompatible server-only libraries, bloating your bundle's size, or exposing your server's code. In this example, we will create an isomorphic proxy with `isomorphine.proxy()`, and export it in the index file of the `/models` directory, thus exposing all the models in the browser.

```js
// in /models/index.js

var isomorphine = require('isomorphine');
var morphine = isomorphine.proxy();

// This will be our main isomorphic gateway to this folder
module.exports = morphine;
```

We are calling `isomorphine.proxy()` in the `index.js` file of the `./models` folder, thus providing all the models in the `./models` folder to the browser, as mirror entity maps.

Based on this example structure, the object created by `isomorphine.proxy()` is:

```js
// The browser gets this ->
{
  User: {
    create: [func ProxiedMethod],
    delete: [func ProxiedMethod]
  },
  config: [func] // This method sets the host and port of your API server
}

// Whereas the server gets this ->
{
  User: {
    create: [func createUser],
    delete: [func deleteUser]
  },
  config: [func emptyFunction] // This method does nothing in the server
  router: [func] // this is the RPC API router that must be mounted in your app
}

// /models/User/create.js and /models/User/delete.js are not actually being
// required in the browser, so don't worry about browser-incompatible modules
```

You can use this fictitious `User` model in the browser by doing this, for example:

```js
// in /client.js, running in the browser

// We can interact with this server-side entity (User)
// without manually having to do any HTTP requests.
//
// If you were to require this model directly from the browser, you'd be requiring
// your whole data layer, probably including your database initialization files
// and other modules that are *not* browser-compatible.
//
// By requiring 'User' through '../models/index.js', which is the file where
// we put 'isomorphine.proxy()', we are actually requiring an object
// which mirrors the methods in the real server-side model.
//
// No server-side modules are actually required. Webpack generates an entity
// map before running this code, so it already knows the API surface area of
// your server-side model.
//
// Remember not to require 'User' directly. You need to require User through
// the gateway we created above. Otherwise, you'd be requiring all the model
// dependencies in the browser.
//
var User = require('../models').User;

// eg. using jquery
$('#button').on('click', function() {

  // When called from the browser, the browser serialized each parameter sent
  // to the function call, and sends the serialized payload via a HTTP request
  // to Isomorphine's endpoint in the server.
  //
  // Isomorphine serializes the result of the function call in the server,
  // returns the resulting values, deserializes the values, and calls
  // this callback function with the resulting values.
  User.create('someUser99', function(err, user) {

    window.alert('User created');

    // uhh, lets delete the user better!
    User.delete(user._id, function(err) {
      window.alert('User deleted');
    });
  });
});
```

To make this work, you must mount the express-based router created by `isomorphine.proxy()` in your app:

```js
// in /server.js
var express = require('express');

// suppose the file we defined above is in ./models/index.js
var morphine = require('./models');

var app = express();

app.use(morphine.router);

// you can mount other middleware and routes in the same app
// app.get('/login', mySecureLoginCtrl);

app.listen(3000, function() {
  console.log('Server listening at port 3000');
});

// Alternatively, if you don't wish to mount isomorphine's middleware in your app,
// you can just start listening for RPCs by doing
var morphine = require('./models');
morphine.router.listen(3000, function() {
  console.log('Server listening at port 3000');
});
```

Multiple arguments in exported functions are supported. You can define and use functions as you would normally do:

```js
// in /client.js, running in the browser
var User = require('./models').User;

User.edit(user._id, { name: 'newName' }, 'moreargs', (err, editedUser, stats) => {
  console.log('User edited. Server said:');
  console.log(editedUser);
  console.log(stats);
});
```

**Your server's files will _not_ be exposed in the browser, nor they will get added to the bundled file.**

It also supports promises and ES6 async/await

```js
// in /client.js, running in the browser
import { User } from '../api';

$('#button').on('click', async () => {

  // using promise-based server-side entities, and async/await in the browser
  const user = await User.create('someUser99');
  window.alert('User created');

  // lets delete this user
  await User.delete(user._id);
  window.alert('User deleted');
});
```

Other than reducing boilerplate code, it really shines in isomorphic applications, where you need the same piece of code running in the browser and the server, for example when doing server-side rendering of a react application.

```js
import { User } from '../models';

// In the browser, calling 'User.get()' will actually make a HTTP request
// to the server, which will make the actual function call,
// serialize the results back to the browser, and resolve the promise with the value(s).
//
// In the server, 'User.get()' will be called directly
// without doing any HTTP requests or any routing whatsoever.
//
// This same piece of code can be run seamlessly in the browser and the server
export default class MyComponent extends React.Component {
  async componentDidMount() {
    const user = await User.get(123);
    this.setState({ user });
  }
}
```

Please read the [caveats](#caveats) for common gotchas.

Also, you can check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone), and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for full examples.


### Webpack Configuration

In order for Isomorphine to work, you need to specify Isomorphine as a webpack loader in your `webpack.config.js` file. The main `isomorphine` package contains the webpack loader so you don't need to install anything else.

```js
module.exports = {
  entry: {...},

  module: {
    preLoaders: [{ loaders: ['isomorphine'] }]
  },
  ...
};
```


### Promise / ES6 Support

Isomorphine supports promises, async/await, and callback-based functions.

```js
// Promise support
module.exports = function getUser() {
  return db.findAsync({ _id: 123 }); // supposing this returns a promise
}
```

```js
// Another promise support example
module.exports = function readSomeFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('somefile.txt', function(err, file) {
      if (err) return reject(err);
      resolve(file);
    });
  });
}
```

```js
// ES6 async/await support
export default async function getUser() {
  const user = await MyUserModel.find({ _id: 123 });

  // await doMoreStuff()...

  return user;
}
```

```js
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

When a call to a server-side function is done from the browser, a special context is passed to the function call. A special `xhr` flag and the request object `req` are passed as the function's context, in `this.xhr` and `this.req`:

```js
// In /models/User/create.js

/**
 * When an endpoint is called from the browser, 'this.xhr' will be true,
 * and you'll be able to access the request object in 'this.req'.
 */
module.exports = function createUser(username, callback) {
  if (this.xhr) {
    console.log('This function is being called remotely!');
    console.log('Request is', this.req);
  }

  myUserModel.create(username, callback);
}
```

You can use this context to validate incoming requests. Please note, Isomorphine is unobtrusive and comes with no security middleware by default (other than this mechanism).

You *must* implement your own security mechanism yourself in an earlier middleware stage (using cookies or redis sessions or JWT or w/e):

```js
// In /models/User/delete.js

module.exports = function deleteUser(userId, callback) {

  // Suppose I have a previous middleware step that adds `isAdmin`
  // to the request object, based on the user's session or else
  if (this.xhr && !this.req.isAdmin) {
    return callback(401);
  }

  myUserModel.delete(userId, callback)
}
```

If the function is not being called remotely, `this.req` will be null, so make sure to validate `this.xhr` before trying to do something with the request object `this.req`.


### Examples

Check the [barebone example](https://github.com/d-oliveros/isomorphine/tree/master/examples/barebone) for a crude example, and the [isomorphic todoMVC](https://github.com/d-oliveros/isomorphic-todomvc) for a full isomorphic react example.

Also go to [Wiselike](https://wiselike.com) to see it running in a production environment, and [ask me anything here!](https://wiselike.com/david)


### Comparison

The two examples below achieve the same result. They both create a web server, register a route that returns a user by user ID, starts listening at port 3000, and call this endpoint from the browser.

One example uses isomorphine, while the other one uses the common approach of building an API route, calling a model from a controller, and building a client-side wrapper for data-fetching logic.

##### With isomorphine:

```js
// in ./api/User/get.js

// Dummy User.get() method
module.exports = function(id, callback) {
  var user = {
    id: id,
    name: 'Some User'
  };

  callback(null, user);
};
```

```js
// in ./api/index.js
var isomoprhine = require('isomorphine');

// make the API entities callable from the browser
var morphine = isomorphine.proxy();

// start listening for RPC calls
morphine.router.listen(3000, function() {
  console.log('Interface listening at port 3000');
});

module.exports = morphine;
```

```js
// in ./client.js
var User = require('./api').User;
var userId = 123;

// just use the model and be happy
User.get(userId, function(err, user) {
  console.log('User is', user);
});
```


##### Without isomorphine:

```js
// in ./api/User/get.js

// Dummy User.get() method
module.exports = function(id, callback) {
  var user = {
    id: id,
    name: 'Some User'
  };

  callback(null, user);
};
```

```js
// in ./api/index.js
var User = require('./User');

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/api/user/:id', function(req, res, next) {
  var userId = req.params.id || 123;

  User.get(userId, function(err, user) {
    if (err) {
      return next(err);
    }
    res.set('Content-Type', 'application/json');
    res.send(user);
  });
});

var server = http.createServer(app);
server.listen(3000, function() {
  console.log('Server listening at port 3000');
});
```

```js
// in ./client.js
var request = require('request');
var userId = 1;

// unnecesary boilerplate code
function getUser(id, callback) {
  request.get(`/api/user/${id}`, function(err, res) {
    if (err) {
      return callback(err);
    }
    var user = res.data;
    callback(null, user);
  });
}

// gets the user
getUser(userId, function(err, user) {
  console.log('User is', user);
});
```


##### With Isomorphine (condensed):

```js
var isomoprhine = require('isomorphine');
var morphine = isomorphine.proxy();
morphine.router.listen(3000, function() {
  console.log('Interface listening at port 3000');
});
module.exports = morphine;
var User = require('./api').User;
var userId = 123;
User.get(userId, function(err, user) {
  console.log('User is', user);
});
```


##### Without Isomorphine (condensed):

```js
var User = require('./User');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.get('/api/user/:id', function(req, res, next) {
  var userId = req.params.id || 123;
  User.get(userId, function(err, user) {
    if (err) {
      return next(err);
    }
    res.set('Content-Type', 'application/json');
    res.send(user);
  });
});
var server = http.createServer(app);
server.listen(3000, function() {
  console.log('Server listening at port 3000');
});
var request = require('request');
var userId = 1;
function getUser(id, callback) {
  request.get(`/api/user/${id}`, function(err, res) {
    if (err) {
      return callback(err);
    }
    var user = res.data;
    callback(null, user);
  });
}
getUser(userId, function(err, user) {
  console.log('User is', user);
});
```

This example took 11 lines of code using Isomorphine. Doing this the traditional way took 35 lines. _And its only one route_

If we were to add more CRUD routes to our model, each route would require:

1. A controller
2. Some request validation
3. A method in your model (maybe)
4. Some wrapper in your client-side application

Plus having to mantain these new components. Multiply this for each route you are currently mantaining, and you'll realize there has to be a better way to streamline your application's development.

With isomorphine, you can just call the server-side model directly. The model is already being supplied to the browser, so you would only require:

1. A new method in your model

No need to re-write the data-fetching layer in the client application, or get parameters out of request object. heck, you don't even need to define and mantain routes. If you need to access the request object for validation purposes or else, you can access it through `this.req` as specified [here](#rpc-context).

_Disclaimer: I'm not saying Isomorphine is the best fit for every case. You should have your routes and middleware in place to handle special actions like auth actions, and should be providing everything you need to correctly authenticate remote calls to your methods. Starting isomorphine directly from `morphine.router.listen()` is not recommended, as Isomorphine is only intended to handle RPCs to server methods. It is not meant to server as a full-blown HTTP server or application stack._



### Caveats

* Your files should export a function in `module.exports` (or `export default` if using ES6 syntax) if you want to be able to use call them from the browser. There is currently no support for exporting objects yet. If anyone figures out a way to determine the exports of a module without requiring its dependencies I'll be happy to merge the PR :D

* Your modules have to be required through the isomorphine proxy. You can not require a server-side entity directly. If you do, you will be importing all the server-side code to the browser's bundle, and possibly breaking your app due to browser-incompatible modules, like `fs`, `express`, `mongo`, database drivers, etc.

* When a function is called directly from the server (eg when called by a cron job), there's no `this.req` object being passed to the function calls, so you must validate sensitive paths in an earlier stage.

* Also, please note that the file where you create the isomorphic proxy, has to be browser-compatible. Isomorphine works by proxying the methods contained in the specified directory, but the file itself will be required as-is in the browser.


### Philosophy

Isomorphine lets you abstract the transport layer in a non-obtrusive way, and change how you program web-based distributed applications. It is meant to increase code reusability between the server and the browser, specially in a full-stack javascript environment.

The idea is to encapsulate the transport layer within javascript's native syntax for importing and exporting modules, while providing a middleware interface to let you mount its API the way you want. This massively reduces development times, as you don't have to worry about the routing layer, and focus on your application's purpose.

Isomorphine proposes an 'endpoint-less' approach, trying to abstract the barriers between a server and the browser's context.

The original idea was to use ES6's `Proxy` in the browser, to proxy any function call from any property of any object existing in any file in the server. Unfortunately, I quickly found out that there was no out-of-the-box support for `Proxy` in most of the major browsers. This led to the idea of using Webpack to pre-generate a map of server-side entities based on filenames. While this work, full support for any type of export will probably come after a wider adoption of ES6's `Proxy` in the browser.


### Tests

```bash
mocha test
```

Cheers.
