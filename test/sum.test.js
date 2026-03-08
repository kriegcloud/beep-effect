import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import sum from '../sum.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('sum', () => {
  it('should be a function', () => {
    strictEqual(typeof sum, 'function')
  })

  it('should return a score function', () => {
    const score = sum([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = sum([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the result with the sum of the given score functions', () => {
    const dataset = rdf.dataset()
    const terms = [ns.ex.resource1, ns.ex.resource2]
    const expected = [{
      dataset,
      graph: undefined,
      term: terms[0],
      score: 1
    }, {
      dataset,
      graph: undefined,
      term: terms[1],
      score: 0.5
    }]

    const score1 = ({ dataset, graph, terms }) => {
      return terms.map(term => {
        return { dataset, graph, term, score: 0.5 }
      })
    }

    const score2 = ({ dataset, graph, terms }) => {
      return [{ dataset, graph, term: terms[0], score: 0.5 }]
    }

    const score = sum([score1, score2])

    const result = score({ dataset, terms })

    deepStrictEqual(result, expected)
  })
})
