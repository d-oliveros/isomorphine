import koa from 'koa';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import {map} from 'lodash';
import invariant from 'invariant';
import isomorphic from './isomorphic';

let api = koa();
let router = koaRouter();

router.all('/:entity/:method', formatArgs, validate, serveRequest);

router.param('entity', function *(entityName, done) {
  this.entity = isomorphic.getEntity(entityName);
  invariant(this.entity, `Entity ${entityName} is not registered.`);
  done();
});

api.use(errorHandler);
api.use(bodyParser());
api.use(router.routes());
api.use(router.allowedMethods());

export default api;

function* errorHandler(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
}

function* formatArgs(next) {
  let body = this.request.body || {};

  this.async = false;

  this.args = map((body.args || []), (arg) => {
    if (arg !== '__clientCallback__')
      return arg;

    this.async = true;

    return (err, ...body) => {
      if (err) throw err;
      console.log(body);
      this.body = body || [];
    };
  });

  yield next;
}

function* validate(next) {
  let {entity, method} = this;

  invariant(typeof entity[method] === 'function',
    `Method ${method} of entity ${entity} is not callable.`);

  yield next;
}

function* serveRequest() {
  let {entity, method, args} = this;

  entity[method](...args);

  if (!this.async) {
    this.body = ['Ok'];
  }
}
