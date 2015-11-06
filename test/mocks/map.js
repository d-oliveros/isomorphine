
module.exports = {
  aSingleMethod: true,

  Entity: {
    doSomething: true,
    doSomethingAsync: true,
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
