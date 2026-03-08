import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'

function pageRank ({ alpha = 0.85, epsilon = 0.000001 } = {}) {
  return ({ dataset, graph, terms }) => {
    terms = new TermSet(terms)

    const nodes = new TermMap()
    const inverse = 1 / terms.size
    let delta = 1

    for (const term of terms) {
      const quads = dataset.match(null, null, term, graph)

      nodes.set(term, {
        weight: inverse,
        outbound: quads.size,
        subjects: [...quads].map(quad => quad.subject).filter(subject => terms.has(subject))
      })
    }

    while (delta > epsilon) {
      const weights = new TermMap()
      let leak = 0

      for (const [term, data] of nodes) {
        weights.set(term, data.weight)

        if (data.outbound === 0) {
          leak += data.weight
        }

        data.weight = 0
      }

      leak *= alpha

      for (const [term, data] of nodes) {
        for (const subject of data.subjects) {
          nodes.get(subject).weight += alpha * weights.get(term) / data.outbound
        }

        data.weight += (1 - alpha) * inverse + leak * inverse
      }

      delta = 0

      for (const [term, data] of nodes) {
        delta += Math.abs(data.weight - weights.get(term))
      }
    }

    const results = []

    for (const [term, data] of nodes) {
      results.push({ dataset, graph, term, score: data.weight })
    }

    return results
  }
}

export default pageRank
