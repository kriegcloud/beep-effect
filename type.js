import factory from '@rdfjs/data-model'

function type (type) {
  const ns = {
    rdf: {
      type: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    }
  }

  return ({ dataset, graph, terms = [] }) => {
    const results = []

    for (const term of terms) {
      for (const quad of dataset.match(term, ns.rdf.type, type, graph)) {
        results.push({ dataset, graph: quad.graph, term, score: 1 })
      }
    }

    return results
  }
}

export default type
