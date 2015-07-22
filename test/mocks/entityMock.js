
export default {
  doSomething() {
    return 'did something.';
  },
  doSomethingAsync(firstParam, secondParam, callback) {
    setTimeout(() => {
      callback(null, 'Sweet', { nested: { thing: ['true', 'dat'] }});
    }, 300);
  }
};
