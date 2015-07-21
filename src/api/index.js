import express from 'express';
import bodyParser from 'body-parser';
import router from './router';

let api = express();
api.use(bodyParser.json());
api.use(router);
api.use(errorHandler);

export default api;

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message);
}
