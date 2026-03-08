import blankNode from './lib/blankNode.js'
import dataset from './lib/dataset.js'
import defaultGraph from './lib/defaultGraph.js'
import literal from './lib/literal.js'
import namedNode from './lib/namedNode.js'
import quad from './lib/quad.js'
import variable from './lib/variable.js'

function toNT (term, { nested } = {}) {
  if (!term) {
    return null
  }

  if (term.termType === 'BlankNode') {
    return blankNode(term)
  }

  if (term.termType === 'DefaultGraph') {
    return defaultGraph()
  }

  if (term.termType === 'Literal') {
    return literal(term)
  }

  if (term.termType === 'NamedNode') {
    return namedNode(term)
  }

  // legacy quad support without .termType
  if (term.termType === 'Quad' || (term.subject && term.predicate && term.object && term.graph)) {
    return quad(term, { nested, toNT })
  }

  if (term.termType === 'Variable') {
    return variable(term)
  }

  if (term[Symbol.iterator]) {
    return dataset(term, toNT)
  }

  throw new Error(`unknown termType ${term.termType}`)
}

export default toNT
