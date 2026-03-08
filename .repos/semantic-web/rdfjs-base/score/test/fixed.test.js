import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import fixed from '../fixed.js'
import sort from '../sort.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('fixed', () => {
  it('should be a function', () => {
    strictEqual(typeof fixed, 'function')
  })

  it('should return a score function', () => {
    const score = fixed({ term: ns.ex.subject })

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = fixed({ term: ns.ex.subject })

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the given term with 1', () => {
    const score = fixed(ns.ex.subject2)
    const dataset = rdf.dataset()
    const terms = [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject2), true)
    strictEqual(result[0].score, 1)
  })

  it('should return an empty result if there is no matching term', () => {
    const score = fixed(ns.ex.subject4)
    const dataset = rdf.dataset()
    const terms = [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3]

    const result = score({ dataset, terms })

    strictEqual(result.length, 0)
  })
})
