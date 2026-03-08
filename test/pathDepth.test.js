import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import pathDepth from '../pathDepth.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('pathDepth', () => {
  it('should be a function', () => {
    strictEqual(typeof pathDepth, 'function')
  })

  it('should return a score function', () => {
    const score = pathDepth()

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = pathDepth()

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the given terms based on the depth of the pathname', () => {
    const dataset = rdf.dataset()
    const terms = [
      ns.ex(''),
      ns.ex.resource1,
      ns.ex('path/resource2'),
      ns.ex('path/path/resource3')
    ]
    const input = { dataset, terms }
    const expected = [{
      dataset,
      graph: undefined,
      score: 1,
      term: terms[0]
    }, {
      dataset,
      graph: undefined,
      score: 0.5,
      term: terms[1]
    }, {
      dataset,
      graph: undefined,
      score: 0.3333333333333333,
      term: terms[2]
    }, {
      dataset,
      graph: undefined,
      score: 0.25,
      term: terms[3]
    }]
    const score = pathDepth()

    const results = score(input)

    deepStrictEqual(results, expected)
  })
})
