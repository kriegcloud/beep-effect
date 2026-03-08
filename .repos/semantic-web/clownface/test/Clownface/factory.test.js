/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('factory', () => {
  it('should create a Clownface object', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    assert(cf instanceof Clownface)
  })

  it('should forward the dataset argument', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].dataset, dataset)
  })

  it('should forward the term argument', () => {
    const dataset = rdf.dataset()
    const term = rdf.namedNode('http://example.org/subject')
    const cf = clownface({ dataset, term })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].term, term)
  })

  it('should forward the value argument', () => {
    const dataset = rdf.dataset()
    const value = 'abc'
    const cf = clownface({ dataset, value })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].term.termType, 'Literal')
    assert.strictEqual(cf._context[0].term.value, value)
  })

  it('should forward the factory argument', () => {
    const dataset = rdf.dataset()
    const factory = rdf
    const cf = clownface({ dataset, factory })

    assert.strictEqual(cf.factory, factory)
    assert.strictEqual(cf._context[0].factory, factory)
  })
})
