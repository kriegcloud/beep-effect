import TupleMap from './lib/TupleMap.js'

function product (list) {
  return ({ dataset, graph, terms = [] }) => {
    if (list.length === 0) {
      return []
    }

    const results = list[0]({ dataset, graph, terms })
    const all = new TupleMap(results.map(result => [[result.term, graph], result]))

    for (let i = 1; i < list.length; i++) {
      const score = list[i]
      const keys = all.keys()
      const current = score({ dataset, graph, terms })

      for (const result of current) {
        const total = all.get([result.term, graph])

        if (total) {
          total.score *= result.score
        }

        keys.delete([result.term, graph])
      }

      for (const key of keys) {
        all.delete(key)
      }
    }

    return [...all.values()]
  }
}

export default product
