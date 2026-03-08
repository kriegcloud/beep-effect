function fallback (list) {
  return ({ dataset, graph, terms = [] }) => {
    for (const score of list) {
      const current = score({ dataset, graph, terms })

      if (current.length > 0) {
        return current
      }
    }

    return []
  }
}

export default fallback
