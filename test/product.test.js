import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import product from '../product.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('product', () => {
  it('should be a function', () => {
    strictEqual(typeof product, 'function')
  })

  it('should return a score function', () => {
    const score = product([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = product([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the result with the product of the given score functions', () => {
    const score1 = ({ dataset, graph, terms }) => {
      return [{ dataset, graph, term: terms[0], score: 0.5 }]
    }
    const score2 = ({ dataset, graph, terms }) => {
      return [{ dataset, graph, term: terms[0], score: 0.5 }]
    }
    const dataset = rdf.dataset()
    const score = product([score1, score2])

    const result = score({ dataset, terms: [ns.ex.subject] })

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject), true)
    strictEqual(result[0].score, 0.25)
  })

  it('should ignore all terms not returned by all score functions', () => {
    const score1 = ({ dataset, graph, terms }) => {
      return [
        { dataset, graph, term: terms[0], score: 0.5 },
        { dataset, graph, term: terms[1], score: 0.5 },
        { dataset, graph, term: terms[2], score: 0.5 }
      ]
    }
    const score2 = ({ dataset, graph, terms }) => {
      return [
        { dataset, graph, term: terms[0], score: 0.5 },
        { dataset, graph, term: terms[1], score: 0.5 }
      ]
    }
    const dataset = rdf.dataset()
    const terms = [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3]
    const score = product([score1, score2])

    const result = score({ dataset, terms })

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject1), true)
    strictEqual(result[0].score, 0.25)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.subject2), true)
    strictEqual(result[1].score, 0.25)
  })
})
