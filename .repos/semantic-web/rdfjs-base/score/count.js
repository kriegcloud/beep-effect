import TermMap from '@rdfjs/term-map'

function count ({ graph, object, predicate, subject = true } = {}) {
  const test = { subject, predicate, object, graph }

  return ({ dataset, graph, terms = [] }) => {
    const counts = new TermMap()
    let total = 0

    const countPart = part => {
      for (const term of terms) {
        const pattern = [
          part === 'subject' && term,
          part === 'predicate' && term,
          part === 'object' && term,
          graph || (part === 'graph' && term)
        ]
        const quads = dataset.match(...pattern)

        for (const quad of quads) {
          const partTerm = quad[part]
          const meta = counts.get(partTerm) || { count: 0 }

          if (!counts.has(partTerm)) {
            counts.set(partTerm, meta)
          }

          meta.count++
          total++
        }
      }
    }

    for (const part of ['subject', 'predicate', 'object', 'graph']) {
      if (test[part]) {
        countPart(part)
      }
    }

    const results = []

    for (const [term, meta] of counts) {
      results.push({ dataset, graph, term, score: meta.count / total })
    }

    return results
  }
}

export default count
