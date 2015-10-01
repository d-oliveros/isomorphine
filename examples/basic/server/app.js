import express from 'express';
import api from '../api';
import renderClient from './render';

let app = express();
app.use(api);
app.get('/', renderClient);

export default app;
