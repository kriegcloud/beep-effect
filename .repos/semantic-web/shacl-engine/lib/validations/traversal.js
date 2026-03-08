import * as ns from '../namespaces.js'

function compileTraversal () {
  return {
    generic: validateTraversal()
  }
}

function validateTraversal () {
  return context => {
    context.trace(ns.shn.TraversalConstraintComponent, {
      args: {},
      message: [context.factory.literal('Traversal')],
      value: context.valueOrNode
    })
  }
}

export {
  compileTraversal
}
