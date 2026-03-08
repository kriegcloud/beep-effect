import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import distinct from '../distinct.js'
import * as ns from './support/namespaces.js'

describe('distinct', () => {
  it('should be a function', () => {
    strictEqual(typeof distinct, 'function')
  })

  it('should return an array', () => {
    const result = distinct([])

    strictEqual(Array.isArray(result), true)
  })

  it('should return a new array', () => {
    const input = []
    const result = distinct(input)

    notStrictEqual(result, input)
  })

  it('should do nothing if the terms of the given results are already unique', () => {
    const input = [{
      term: ns.ex.resource1,
      score: 0.5
    }, {
      term: ns.ex.resource2,
      score: 1
    }, {
      term: ns.ex.resource3,
      score: 0.25
    }]

    const result = distinct(input)

    deepStrictEqual(result, input)
  })

  it('should keep only the best result if there are multiple results with the same term', () => {
    const input = [{
      term: ns.ex.resource1,
      score: 0.5
    }, {
      term: ns.ex.resource1,
      score: 1
    }, {
      term: ns.ex.resource2,
      score: 0.25
    }]

    const expected = [input[1], input[2]]

    const result = distinct(input)

    deepStrictEqual(result, expected)
  })
})
