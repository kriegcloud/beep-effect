import scale from './scale.js'
import sum from './sum.js'

function combine (list) {
  const factor = 1 / list.length

  return sum(list.map(score => scale({ factor, score })))
}

function prioritized (list) {
  const step = 2 / (list.length * (list.length + 1))

  const scaled = list.map((score, index) => {
    const factor = (list.length - index) * step

    return scale({ factor, score })
  })

  return sum(scaled)
}

combine.prioritized = prioritized

export default combine
export {
  prioritized
}
