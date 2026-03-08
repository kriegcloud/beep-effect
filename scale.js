function scale ({ factor, score }) {
  return ({ dataset, graph, terms = [] }) => {
    return score({ dataset, graph, terms }).map(result => {
      result.score *= factor

      return result
    })
  }
}

export default scale
