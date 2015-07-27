import express from 'express';
import bodyParser from 'body-parser';
import isomorphine from 'isomorphine';
import renderClient from './render';

let app = express();

app.use(bodyParser.json());
app.use(isomorphine.router(express));

app.use('/', renderClient);

export default app;
