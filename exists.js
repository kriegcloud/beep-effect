function exists ({ graph, object, predicate, subject }) {
  const test = { subject, predicate, object, graph }

  return ({ dataset, graph, terms = [] }) => {
    for (const term of terms) {
      const found = [{ dataset, graph, term, score: 1 }]

      if (test.subject) {
        if (test.subject.equals(term) && dataset.match(term, null, null, graph).size > 0) {
          return found
        }
      }

      if (test.predicate) {
        if (test.predicate.equals(term) && dataset.match(null, term, null, graph).size > 0) {
          return found
        }
      }

      if (test.object) {
        if (test.object.equals(term) && dataset.match(null, null, term, graph).size > 0) {
          return found
        }
      }

      if (test.graph) {
        if (test.graph.equals(term) && (!graph || test.graph.equals(graph)) && dataset.match(null, null, null, graph).size > 0) {
          return found
        }
      }
    }

    return []
  }
}

export default exists
