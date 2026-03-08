/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.blankNode', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.blankNode, 'function')
  })

  it('should return a new Clownface instance', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.blankNode()

    assert(result instanceof Clownface)
    assert.notStrictEqual(result, cf)
  })

  it('should use the dataset from the context', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    const result = cf.blankNode()

    assert.strictEqual(result._context[0].dataset, dataset)
  })

  it('should create a context with a Blank Node term', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.blankNode()

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'BlankNode')
  })

  it('should use the given label for the Blank Node', () => {
    const label = 'b321'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.blankNode(label)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'BlankNode')
    assert.strictEqual(result._context[0].term.value, label)
  })

  it('should support multiple values in an array', () => {
    const labelA = 'b321a'
    const labelB = 'b321b'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.blankNode([labelA, labelB])

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'BlankNode')
    assert.strictEqual(result._context[0].term.value, labelA)
    assert.strictEqual(result._context[1].term.termType, 'BlankNode')
    assert.strictEqual(result._context[1].term.value, labelB)
  })

  it('should support multiple values in an iterable', () => {
    const labelA = 'b321a'
    const labelB = 'b321b'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.blankNode(new Set([labelA, labelB]))

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'BlankNode')
    assert.strictEqual(result._context[0].term.value, labelA)
    assert.strictEqual(result._context[1].term.termType, 'BlankNode')
    assert.strictEqual(result._context[1].term.value, labelB)
  })
})
