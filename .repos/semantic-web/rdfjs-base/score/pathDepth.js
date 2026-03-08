function pathDepth () {
  return ({ dataset, graph, terms = [] }) => {
    const results = []

    for (const term of terms) {
      let score = Number.EPSILON

      if (term.termType === 'NamedNode') {
        let pathname = (new URL(term.value)).pathname

        if (pathname.endsWith('/')) {
          pathname = pathname.slice(0, -1)
        }

        const pathDepth = pathname.split('/').length

        score = 1 / pathDepth
      }

      results.push({ dataset, graph, term, score })
    }

    return results
  }
}

export default pathDepth
