import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import fallback from '../fallback.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('fallback', () => {
  it('should be a function', () => {
    strictEqual(typeof fallback, 'function')
  })

  it('should return a score function', () => {
    const score = fallback([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = fallback([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should call all given score functions until one has a result', () => {
    const dataset = rdf.dataset()
    const score = fallback([
      () => {
        return []
      },
      () => {
        return [{ dataset, term: ns.ex.resource1, score: 0.5 }]
      },
      () => {
        return [{ dataset, term: ns.ex.resource2, score: 0.75 }]
      }
    ])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.resource1), true)
    strictEqual(result[0].score, 0.5)
  })
})
