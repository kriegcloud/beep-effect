/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.literal', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.literal, 'function')
  })

  it('should return a new Clownface instance', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal('example')

    assert(result instanceof Clownface)
    assert.notStrictEqual(result, cf)
  })

  it('should use the dataset from the context', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    const result = cf.literal('example')

    assert.strictEqual(result._context[0].dataset, dataset)
  })

  it('should use the given string as Literal', async () => {
    const value = '2311 North Los Robles Avenue, Aparment 4A'
    const cf = clownface({ dataset: await loadExample() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value)
  })

  it('should use the given double number as Literal', () => {
    const value = 1.23
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString(10))
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#double')
  })

  it('should use the given integer number as Literal', () => {
    const value = 123
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString(10))
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#integer')
  })

  it('should use the given boolean as Literal', () => {
    const value = true
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString())
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#boolean')
  })

  it('should use the given false boolean as Literal', () => {
    const value = false
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString())
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#boolean')
  })

  it('should use the numeric 0 as Literal', () => {
    const value = 0
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString())
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#integer')
  })

  it('should use empty string as Literal', () => {
    const value = ''
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, value.toString())
    assert.strictEqual(result._context[0].term.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
  })

  it('should not create nodes for empty array', () => {
    const value = []
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(value)

    assert.strictEqual(result._context.length, 0)
  })

  it('should support multiple values in an array', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(['1', '2'])

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, '1')
    assert.strictEqual(result._context[1].term.termType, 'Literal')
    assert.strictEqual(result._context[1].term.value, '2')
  })

  it('should support multiple values in an iterable', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal(new Set(['1', '2']))

    assert.strictEqual(result._context.length, 2)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, '1')
    assert.strictEqual(result._context[1].term.termType, 'Literal')
    assert.strictEqual(result._context[1].term.value, '2')
  })

  it('should use the given datatype', () => {
    const datatypeIri = 'http://example.org/datatype'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal('example', datatypeIri)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.datatype.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.datatype.value, datatypeIri)
  })

  it('should accept rdfjs NamedNodes as datatype', () => {
    const datatype = rdf.namedNode('http://example.org/datatype')
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal('example', datatype)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.datatype.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.datatype.value, datatype.value)
  })

  it('should use the given language', () => {
    const language = 'en'
    const cf = clownface({ dataset: rdf.dataset() })

    const result = cf.literal('example', language)

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.datatype.termType, 'NamedNode')
    assert.strictEqual(result._context[0].term.language, language)
  })
})
