import * as ns from './lib/namespaces.js'
import { select } from './lib/sparql.js'
import { compileSparql } from './lib/validations/sparql.js'

const validations = new Map([
  [ns.sh.sparql, compileSparql]
])

async function resolveSparqlTarget (targetPtr, context) {
  const selectQuery = targetPtr.out([ns.sh.select]).value

  if (!selectQuery) {
    return []
  }

  const bindingsArray = await select({
    dataset: context.focusNode.dataset,
    factory: context.factory,
    query: selectQuery,
    bindings: []
  })

  const thisVar = context.factory.variable('this')

  return bindingsArray
    .map(binding => binding.get(thisVar))
    .filter(Boolean)
}

const targetResolvers = new Map([
  [ns.sh.target, resolveSparqlTarget]
])

export {
  targetResolvers,
  validations
}
