function fixed (term) {
  const given = term

  return ({ dataset, graph, terms = [] }) => {
    for (const term of terms) {
      if (term.equals(given)) {
        return [{ dataset, graph, term, score: 1 }]
      }
    }

    return []
  }
}

export default fixed
