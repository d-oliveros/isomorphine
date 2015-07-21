import {isomorphic, api} from '../src';
import request from 'supertest';

let endpoint = api.callback();

let entity = {
  doSomething() {
    return 'did something.';
  },
  doSomethingAsync(firstParam, secondParam, callback) {
    setTimeout(() => callback(null, 'Sweet'), 300);
  }
};

describe('API', () => {

  before(() => {
    isomorphic('EntityName', entity);
  });

  it('should return OK', (done) => {
    request(endpoint)
      .get('/EntityName/doSomething')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(['Ok'])
      .end(done);
  });

  it('should call the correct method and return the results', (done) => {
    request(endpoint)
      .post('/EntityName/doSomethingAsync')
      .send({ args: ['oneParam', 'anotherParam', '__clientCallback__'] })
      .expect(200)
      .expect(['Sweet'])
      .end(done);
  });
});
