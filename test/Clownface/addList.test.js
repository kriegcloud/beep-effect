import assert from 'assert'
import { describe, it } from 'mocha'
import Environment from '@rdfjs/environment'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import * as ns from '../support/namespace.js'
import CustomDataFactory from '../support/CustomDataFactory.js'

describe('.addList', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.addList, 'function')
  })

  it('should throw an error if object parameter is missing', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const cf = clownface({ dataset, term: subject })

    let touched = false

    try {
      cf.addList(predicate)
    } catch (err) {
      touched = true
    }

    assert(touched)
  })

  it('should throw an error if predicate parameter is missing', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const object = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const cf = clownface({ dataset, term: subject })

    let touched = false

    try {
      cf.addList(null, object)
    } catch (err) {
      touched = true
    }

    assert(touched)
  })

  it('should add list quads using the context term as subject and the given predicate and items', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const predicate = rdf.namedNode('http://schema.org/counts')
    const item0 = rdf.literal('0')
    const item1 = rdf.literal('1')
    const cf = clownface({ dataset, term: subject })

    cf.addList(predicate, [item0, item1])

    const entry = [...dataset.match(subject, predicate)][0]
    const first0 = [...dataset.match(entry.object, ns.first, item0)][0]
    const rest0 = [...dataset.match(entry.object, ns.rest)][0]
    const first1 = [...dataset.match(rest0.object, ns.first, item1)][0]
    const rest1 = [...dataset.match(rest0.object, ns.rest, ns.nil)][0]

    assert(entry)
    assert.strictEqual(entry.object.termType, 'BlankNode')
    assert(first0)
    assert(rest0)
    assert.strictEqual(rest0.object.termType, 'BlankNode')
    assert(first1)
    assert(rest1)
  })

  it('should use the provided factory', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const item0 = rdf.literal('0')
    const factory = new Environment([NamespaceFactory, CustomDataFactory])

    clownface({ dataset, term: subject, factory }).addList(predicate, [item0])

    const entry = [...dataset.match(subject, predicate)][0]
    const first0 = [...dataset.match(entry.object, ns.first, item0)][0]
    const rest0 = [...dataset.match(entry.object, ns.rest, ns.nil)][0]

    assert.strictEqual(entry.testProperty, 'test')
    assert.strictEqual(entry.object.testProperty, 'test')
    assert.strictEqual(first0.testProperty, 'test')
    assert.strictEqual(first0.predicate.testProperty, 'test')
    assert.strictEqual(rest0.testProperty, 'test')
    assert.strictEqual(rest0.predicate.testProperty, 'test')
  })

  it('should not add quads if context is undefined', () => {
    const dataset = rdf.dataset()
    const graph = clownface({ dataset })
    const predicate = rdf.namedNode('http://example.org/foo')

    graph.addList(predicate, ['bar', 'baz'])

    assert.strictEqual(dataset.size, 0)
  })
})
