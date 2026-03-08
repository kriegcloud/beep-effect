/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.namedNode', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.namedNode, 'function')
  })

  it('should return a new Clownface instance', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.namedNode('http://localhost:8080/data/person/stuart-bloom')

    assert(result instanceof Clownface)
    assert.notStrictEqual(result, cf)
  })

  it('should use the dataset from the context', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    const result = cf.namedNode('http://localhost:8080/data/person/stuart-bloom')

    assert.strictEqual(result._context[0].dataset, dataset)
  })

  it('should use the given string as IRI for the Named Node', () => {
    const iri = 'http://localhost:8080/data/person/stuart-bloom'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.namedNode(iri)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.value, iri)
  })

  it('should support multiple values in an array', () => {
    const iriA = 'http://example.org/a'
    const iriB = 'http://example.org/b'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.namedNode([iriA, iriB])

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.value, iriA)
    assert.strictEqual(result._context[1].term.termType, 'NamedNode')
    assert.strictEqual(result._context[1].term.value, iriB)
  })

  it('should support multiple values from NamedNode iterator', () => {
    const iriA = rdf.namedNode('http://example.org/a')
    const iriB = rdf.namedNode('http://example.org/b')
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.namedNode(rdf.termSet([iriA, iriB]))

    assert.strictEqual(result._context.length, 2)
    assert.deepStrictEqual(result._context[0].term, iriA)
    assert.deepStrictEqual(result._context[1].term, iriB)
  })

  it('should support multiple values from string iterator', () => {
    const iriA = 'http://example.org/a'
    const iriB = 'http://example.org/b'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.namedNode(new Set([iriA, iriB]))

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.value, iriA)
    assert.strictEqual(result._context[1].term.termType, 'NamedNode')
    assert.strictEqual(result._context[1].term.value, iriB)
  })
})
