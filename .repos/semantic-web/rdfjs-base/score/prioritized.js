import scale from './scale.js'

function prioritized (list) {
  return ({ dataset, graph, terms = [] }) => {
    const all = []
    const step = 2 / (list.length * (list.length + 1))

    for (let index = 0; index < list.length; index++) {
      const factor = (list.length - index) * step
      const score = scale({ factor, score: list[index] })

      for (const result of score({ dataset, graph, terms })) {
        all.push(result)
      }
    }

    return all
  }
}

export default prioritized
