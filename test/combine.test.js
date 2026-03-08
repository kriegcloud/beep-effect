import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import combine from '../combine.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('combine', () => {
  it('should be a function', () => {
    strictEqual(typeof combine, 'function')
  })

  it('should return a score function', () => {
    const score = combine([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = combine([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the result combined based on the given score functions', () => {
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
        return { dataset, graph, term, score: 1 }
      })
    }

    const score2 = ({ dataset, graph, terms }) => {
      return [{ dataset, graph, term: terms[0], score: 1 }]
    }

    const score = combine([score1, score2])

    const result = score({ dataset, terms })

    deepStrictEqual(result, expected)
  })

  describe(('.prioritized'), () => {
    it('should be a function', () => {
      strictEqual(typeof combine.prioritized, 'function')
    })

    it('should return a score function', () => {
      const score = combine.prioritized([])

      strictEqual(typeof score, 'function')
      strictEqual(score.length, 1)
    })

    it('should return an array', () => {
      const score = combine.prioritized([])

      const result = score({ dataset: rdf.dataset(), terms: [] })

      strictEqual(Array.isArray(result), true)
    })

    it('should score the result combined based on the given score functions with priorities', () => {
      const dataset = rdf.dataset()
      const terms = [ns.ex.resource1, ns.ex.resource2]
      const expected = [{
        dataset,
        graph: undefined,
        term: terms[0],
        score: 0.8333333333333333
      }, {
        dataset,
        graph: undefined,
        term: terms[1],
        score: 0.6666666666666666
      }]

      const score1 = ({ dataset, graph, terms }) => {
        return terms.map(term => {
          return { dataset, graph, term, score: 1 }
        })
      }

      const score2 = ({ dataset, graph, terms }) => {
        return [{ dataset, graph, term: terms[0], score: 1 }]
      }

      const score3 = ({ dataset, graph, terms }) => {
        return [{ dataset, graph, term: terms[1], score: 1 }]
      }

      const score = combine.prioritized([score1, score2, score3])

      const result = score({ dataset, terms })

      deepStrictEqual(result, expected)
    })
  })
})
