/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.map', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.map, 'function')
  })

  it('should return an Array', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert(Array.isArray(cf.map(item => item)))
  })

  it('should call the function with Dataset parameter', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.in(rdf.namedNode('http://schema.org/knows')).map(item => {
      assert(item instanceof Clownface)

      return true
    })
  })

  it('should call the function for each context', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    let count = 0

    cf.in(rdf.namedNode('http://schema.org/knows')).map(() => {
      count++

      return true
    })

    assert.strictEqual(count, 7)
  })

  it('should return an array of all return values', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.in(rdf.namedNode('http://schema.org/knows')).map((item, index) => index)

    assert.deepStrictEqual(result, [0, 1, 2, 3, 4, 5, 6])
  })
})
