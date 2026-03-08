/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.toArray', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.toArray, 'function')
  })

  it('should return an array', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert(Array.isArray(cf.toArray()))
  })

  it('should return a Dataset instance for every context object', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.in(rdf.namedNode('http://schema.org/knows')).toArray()

    assert.strictEqual(result.length, 7)
    assert(result[0] instanceof Clownface)
  })

  it('should not return an instance for undefined context', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const array = cf.toArray()

    assert.strictEqual(array.length, 0)
  })
})
