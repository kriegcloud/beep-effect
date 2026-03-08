function concat (list) {
  return ({ dataset, graph, terms = [] }) => {
    return list.flatMap(score => {
      return score({ dataset, graph, terms })
    })
  }
}

export default concat
