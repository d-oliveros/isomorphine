var express = require('express');
var bodyParser = require('body-parser');
var ctrls = require('./controllers');

var api = express();

api.use(bodyParser.json());

api.param('entity', ctrls.entityLoader);

api.all('/isomorphine/:entity/:method', ctrls.getPayload, ctrls.serveRequest);

module.exports = api;
