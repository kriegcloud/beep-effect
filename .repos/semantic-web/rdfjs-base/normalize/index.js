import RDFC10Sync from 'rdf-canonize/lib/RDFC10Sync.js'

function toJsonldQuad (quad) {
  return {
    subject: toJsonldTerm(quad.subject),
    predicate: toJsonldTerm(quad.predicate),
    object: toJsonldTerm(quad.object),
    graph: toJsonldTerm(quad.graph)
  }
}

function toJsonldTerm (term) {
  if (term.termType === 'BlankNode') {
    return {
      termType: 'BlankNode',
      value: `_:${term.value}`
    }
  }

  return term
}

function toJsonldDataset (dataset) {
  return [...dataset].map(quad => toJsonldQuad(quad))
}

function normalize (dataset) {
  const canonize = new RDFC10Sync({ maxDeepIterations: 500 })

  return canonize.main(toJsonldDataset(dataset))
}

export default normalize
