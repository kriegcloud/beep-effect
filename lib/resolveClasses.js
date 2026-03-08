import TermSet from '@rdfjs/term-set'
import PathList from 'grapoi/PathList.js'
import * as ns from './namespaces.js'

function resolveClasses (classes) {
  const resolved = new TermSet()

  const ptr = new PathList({ dataset: classes.dataset, terms: classes.terms })
  const results = ptr.execute({
    quantifier: 'zeroOrMore',
    start: 'object',
    end: 'subject',
    predicates: [ns.rdfs.subClassOf]
  })

  for (const result of results.ptrs) {
    for (const { term } of result.nodes()) {
      resolved.add(term)
    }
  }

  return resolved
}

export default resolveClasses
