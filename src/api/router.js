import {Router} from 'express';
import isomorphic from '../morphic';

let debug = require('debug')('morphic:router');
let router = Router();

router.all('/:entity/:method', formatArgs, serveRequest);

router.param('entity', (req, res, next, id) => {
  debug(`Looking for isomorphic entity: ${id}`);

  let method = req.params.method;

  req.entityId = id;
  req.entity = isomorphic.getEntity(id);

  if (!req.entity) {
    return next(new Error(`Entity ${id} is not registered.`));
  }

  if (!method) {
    return next(new Error(`Entity ${id} requested without a method.`));
  }

  if (typeof req.entity[method] !== 'function') {
    return next(Error(`Method ${method} of entity ${req.entity} is not callable.`));
  }

  next();
});

function formatArgs(req, res, next) {
  req.async = false;

  // Transform the '__clientCallback__' argument to an actual callback func
  req.args = (req.body.args || []).map((arg) => {
    if (arg !== '__clientCallback__') return arg;

    req.async = true;

    return (err, ...values) => {
      if (err) return next(err);

      debug(`Callback function called. Values are:`, values);

      res.json({ values });
    };
  });

  debug(`Request is async? ${req.async}. Arguments are:`, req.args);

  next();
}

function serveRequest(req, res) {
  let {params, args, entityId} = req;
  let {method} = params;

  debug(`Calling ${entityId}.${method}() with arguments:`, args);

  req.entity[method](...args);

  if (!req.async) {
    res.json({ values: ['Ok'] });
  }
}


export default router;
