import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import concat from '../concat.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('concat', () => {
  it('should be a function', () => {
    strictEqual(typeof concat, 'function')
  })

  it('should return a score function', () => {
    const score = concat([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = concat([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should process all given score function and concatenate the results', () => {
    const dataset = rdf.dataset()
    const score = concat([
      () => {
        return [
          { dataset, term: ns.ex.resource1, score: 0.25 },
          { dataset, term: ns.ex.resource2, score: 0.5 }
        ]
      },
      () => {
        return [
          { dataset, term: ns.ex.resource3, score: 0.75 },
          { dataset, term: ns.ex.resource4, score: 1 }
        ]
      }
    ])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(result.length, 4)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.resource1), true)
    strictEqual(result[0].score, 0.25)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.resource2), true)
    strictEqual(result[1].score, 0.5)
    strictEqual(result[2].dataset, dataset)
    strictEqual(result[2].term.equals(ns.ex.resource3), true)
    strictEqual(result[2].score, 0.75)
    strictEqual(result[3].dataset, dataset)
    strictEqual(result[3].term.equals(ns.ex.resource4), true)
    strictEqual(result[3].score, 1)
  })
})
