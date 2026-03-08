import TupleMap from './lib/TupleMap.js'

function distinct (results) {
  const all = new TupleMap()

  for (const result of results) {
    const current = all.get([result.term, result.graph])

    if (!current) {
      all.set([result.term, result.graph], result)
    } else if (current.score < result.score) {
      all.delete([result.term, result.graph])
      all.set([result.term, result.graph], result)
    }
  }

  return [...all.values()]
}

export default distinct
