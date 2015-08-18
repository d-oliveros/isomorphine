import express from 'express';
import isomorphine from 'isomorphine';
import renderClient from './render';

let app = express();
app.use(isomorphine.router);
app.get('/', renderClient);

export default app;
