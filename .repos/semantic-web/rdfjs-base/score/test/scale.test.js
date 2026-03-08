import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import scale from '../scale.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('scale', () => {
  it('should be a function', () => {
    strictEqual(typeof scale, 'function')
  })

  it('should return a score function', () => {
    const score = scale({ factor: 1, score: () => {} })

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = scale({
      factor: 1,
      score: ({ dataset, graph, terms }) => {
        return terms.map(term => {
          return { dataset, graph, term, score: 1 }
        })
      }
    })

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should scale the score of all results by the given factor', () => {
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
      score: 0.25
    }]

    const score = scale({
      factor: 0.5,
      score: ({ dataset, graph, terms }) => {
        return terms.map(term => {
          const score = term.equals(ns.ex.resource1) ? 1 : 0.5
          return { dataset, graph, term, score }
        })
      }
    })

    const result = score({ dataset, terms })

    deepStrictEqual(result, expected)
  })
})
