# Isomorphine

Use your serverside models and libraries from the client, without exposing your serverside code or breaking/bloating your bundle, while conserving your module's API surface area.

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

* Check [this](https://github.com/d-oliveros/isomorphine/tree/master/examples/basic) for a full example.

Lets say you have a models folder that looks like this, but you can't require and
use these modules on the browser, as the browser doesn't have access to the database
layer (And you don't want to pollute the bundled file):

```
/models/index.js
/models/User/create.js
/models/User/delete.js
/models/Post/create.js
/client/index.js
/server/app.js
...
```

You can expose these objects in the browser and share the same API in an
isomorphic fashion, by doing:


```js
// In /models/index.js

var isomorphine = require('isomorphine');

module.exports = isomorphine.inject(__dirname);
```

You also need to add the router in your app's middleware:

```js
// In /server/app.js

var express = require('express');
var isomorphine = require('isomorphine');

var app = express();

app.use(isomorphine.router);
```

After doing that, you can use the models in the browser by doing:
```js
// In /client/index.js

var User = require('../models').User;

User.create({ name: 'Hi there!' }, 'any params you want', function(err, user, anotherVal) {
  console.log('Got back! User is: ', user);
});
```

Or in the server, by doing:
```js
// In /server/app.js

var User = require('../models').User;

User.create({ name: 'Hi there!' }, 'any params you want', function(err, user, anotherVal) {
  console.log('Got back! User is: ', user);
});
```

Your modules will _not_ be exposed in the browser, nor they will get added to the bundled file.


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

### TODO

* Write better docs

### Test

```bash
mocha test
```

Cheers.
