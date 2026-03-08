/* global describe, it */

import assert from 'assert'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('constructor', () => {
  it('should create a Clownface object', () => {
    const dataset = rdf.dataset()
    const cf = new Clownface({ dataset, factory: rdf })

    assert(cf instanceof Clownface)
  })

  it('should create an empty context using the given dataset', () => {
    const dataset = rdf.dataset()
    const cf = new Clownface({ dataset, factory: rdf })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].dataset, dataset)
    assert(!cf._context[0].graph)
    assert(!cf._context[0].term)
  })

  it('should create an empty context using the given graph', () => {
    const dataset = rdf.dataset()
    const graph = rdf.namedNode('http://example.org/graph')
    const cf = new Clownface({ dataset, graph, factory: rdf })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].dataset, dataset)
    assert.strictEqual(cf._context[0].graph, graph)
    assert(!cf._context[0].term)
  })

  it('should create a context using the given term', () => {
    const dataset = rdf.dataset()
    const term = rdf.namedNode('http://example.org/subject')
    const cf = new Clownface({ dataset, term, factory: rdf })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].term, term)
  })

  it('should create a context using the given terms', () => {
    const dataset = rdf.dataset()
    const termA = rdf.namedNode('http://example.org/subjectA')
    const termB = rdf.namedNode('http://example.org/subjectB')
    const cf = new Clownface({ dataset, term: [termA, termB], factory: rdf })

    assert.strictEqual(cf._context.length, 2)
    assert.strictEqual(cf._context[0].term, termA)
    assert.strictEqual(cf._context[1].term, termB)
  })

  it('should create a context using the given value', () => {
    const dataset = rdf.dataset()
    const value = 'abc'
    const cf = new Clownface({ dataset, value, factory: rdf })

    assert.strictEqual(cf._context.length, 1)
    assert.strictEqual(cf._context[0].term.termType, 'Literal')
    assert.strictEqual(cf._context[0].term.value, value)
  })

  it('should create a context using the given values', () => {
    const dataset = rdf.dataset()
    const valueA = 'abc'
    const valueB = 'bcd'
    const cf = new Clownface({ dataset, value: [valueA, valueB], factory: rdf })

    assert.strictEqual(cf._context.length, 2)
    assert.strictEqual(cf._context[0].term.termType, 'Literal')
    assert.strictEqual(cf._context[0].term.value, valueA)
    assert.strictEqual(cf._context[1].term.termType, 'Literal')
    assert.strictEqual(cf._context[1].term.value, valueB)
  })

  it('should prioritize term over value', () => {
    const dataset = rdf.dataset()
    const termA = rdf.namedNode('http://example.org/subjectA')
    const termB = rdf.namedNode('http://example.org/subjectB')
    const valueA = 'abc'
    const valueB = 'bcd'
    const cf = new Clownface({ dataset, term: [termA, termB], value: [valueA, valueB], factory: rdf })

    assert.strictEqual(cf._context.length, 2)
    assert.strictEqual(cf._context[0].term, termA)
    assert.strictEqual(cf._context[1].term, termB)
  })

  it('should use the given _context', () => {
    const dataset = rdf.dataset()
    const term = rdf.namedNode('http://example.org/subject')
    const cf = new Clownface({ dataset, term, factory: rdf })
    const clone = new Clownface(cf)

    assert.strictEqual(clone._context, cf._context)
  })

  it('should inherit factory of the given _context', () => {
    const dataset = rdf.dataset()
    const term = rdf.namedNode('http://example.org/subject')
    const factory = rdf
    const cf = new Clownface({ dataset, term, factory })
    const clone = new Clownface(cf)

    assert.strictEqual(clone.factory, factory)
    assert.strictEqual(clone._context[0].factory, factory)
  })

  it('should prioritize _context over term', () => {
    const dataset = rdf.dataset()
    const term = rdf.namedNode('http://example.org/subject')
    const cf = new Clownface({ dataset, term, factory: rdf })
    const clone = new Clownface({ term, _context: cf._context, factory: rdf })

    assert.strictEqual(clone._context, cf._context)
  })

  it('should throw an error if an unknown type is given as value', () => {
    const dataset = rdf.dataset()

    let error = null

    try {
      Boolean(new Clownface({ dataset, value: new RegExp(), factory: rdf }))
    } catch (err) {
      error = err
    }

    assert(error)
    assert(error.message.includes('cannot be converted') > 0)
  })
})
