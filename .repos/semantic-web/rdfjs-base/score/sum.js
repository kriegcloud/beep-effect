import TupleMap from './lib/TupleMap.js'

function sum (list) {
  return ({ dataset, graph, terms = [] }) => {
    const all = new TupleMap()

    for (let i = 0; i < list.length; i++) {
      const score = list[i]

      const current = score({ dataset, graph, terms })

      for (const result of current) {
        const total = all.get([result.term, graph])

        if (!total) {
          all.set([result.term, graph], result)
        } else {
          total.score += result.score
        }
      }
    }

    return [...all.values()]
  }
}

export default sum
