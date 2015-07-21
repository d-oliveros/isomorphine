import {Router} from 'express';
import isomorphic from '../isomorphic';

let router = Router();

router.all('/:entity/:method', formatArgs, serveRequest);

router.param('entity', (req, res, next, id) => {
  let method = req.params.method;
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

    return (err, ...body) => {
      if (err) return next(err);
      res.json(body || []);
    };
  });

  next();
}

function serveRequest(req, res) {
  let {params, args} = req;
  let {method} = params;

  req.entity[method](...args);

  if (!req.async) {
    res.json(['Ok']);
  }
}


export default router;
