import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import prioritized from '../prioritized.js'
import sort from '../sort.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('prioritized', () => {
  it('should be a function', () => {
    strictEqual(typeof prioritized, 'function')
  })

  it('should return a score function', () => {
    const score = prioritized([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = prioritized([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should process all given score function and prioritize the result based on the given order', () => {
    const dataset = rdf.dataset()
    const terms = [ns.ex.resource1, ns.ex.resource2]
    const expected = [{
      dataset,
      graph: undefined,
      term: terms[0],
      score: 0.5
    }, {
      dataset,
      graph: undefined,
      term: terms[1],
      score: 0.3333333333333333
    }, {
      dataset,
      graph: undefined,
      term: terms[1],
      score: 0.16666666666666666
    }]

    const score = prioritized([
      ({ dataset, graph }) => {
        return [{ dataset, graph, term: terms[0], score: 1 }]
      },
      ({ dataset, graph }) => {
        return [{ dataset, graph, term: terms[1], score: 1 }]
      },
      ({ dataset, graph }) => {
        return [{ dataset, graph, term: terms[1], score: 1 }]
      }
    ])

    const result = sort(score({ dataset, terms }))

    deepStrictEqual(result, expected)
  })
})
