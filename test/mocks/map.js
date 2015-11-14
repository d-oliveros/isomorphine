
module.exports = {
  aSingleMethod: true,

  Entity: {
    doSomething: true,
    doSomethingAsync: true,
    returnPromise: true,
    returnValue: true,
    withContext: true,
    withValidation: true
  },

  NestedEntity: {
    aMethod: true,
    ChildEntity: {
      childMethod: true
    }
  }
};
