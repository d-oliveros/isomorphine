var express = require('express');
var bodyParser = require('body-parser');
var apiFactory = require('../../lib/router');

module.exports = function createApi() {
  return apiFactory(express, bodyParser.json());
};
