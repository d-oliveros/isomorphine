
export default function createProxy(name) {
  return new Proxy({}, {
    get(target, method) {
      return (...args) => {

        // Transform callback function to '__clientCallback__' string
        // - First function argument should be considered callback function
        // - No arguments should be allowed after callback argument
        // Do request to /{name}/{method}
        // On data return, apply callback with backend data
        // - Error should not be returned as-is from the server.
        // - Error should be handled independantly
      };
    }
  });
}
