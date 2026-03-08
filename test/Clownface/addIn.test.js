import assert from 'assert'
import { describe, it } from 'mocha'
import sinon from 'sinon'
import { addAll } from 'rdf-dataset-ext'
import Environment from '@rdfjs/environment'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import CustomDataFactory from '../support/CustomDataFactory.js'

describe('.addIn', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.addIn, 'function')
  })

  it('should throw an error if predicate parameter is missing', () => {
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset: rdf.dataset(), term: object })

    let touched = false

    try {
      cf.addIn(null, subject)
    } catch (err) {
      touched = true
    }

    assert(touched)
  })

  it('should add quads using the context term as object and the given predicate and subject', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    cf.addIn(predicate, subject)

    const result = dataset.match(subject, predicate, object)

    assert.strictEqual(result.size, 1)
  })

  it('should create a Blank Node subject if no subject was given', () => {
    const dataset = rdf.dataset()
    const predicate = rdf.namedNode('http://schema.org/knows')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    cf.addIn(predicate)

    const result = dataset.match(null, predicate, object)

    assert.strictEqual(result.size, 1)
    assert.strictEqual([...result][0].subject.termType, 'BlankNode')
  })

  it('should support array values as predicate', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicateA = rdf.namedNode('http://schema.org/knows')
    const predicateB = rdf.namedNode('http://schema.org/saw')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    cf.addIn([predicateA, predicateB], subject)

    const result = addAll(
      dataset.match(subject, predicateA, object),
      dataset.match(subject, predicateB, object))

    assert.strictEqual(result.size, 2)
  })

  it('should support array values as subject', () => {
    const dataset = rdf.dataset()
    const subjectA = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const subjectB = rdf.namedNode('http://localhost:8080/data/person/penny')
    const predicate = rdf.namedNode('http://schema.org/saw')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    cf.addIn(predicate, [subjectA, subjectB])

    const result = addAll(
      dataset.match(subjectA, predicate, object),
      dataset.match(subjectB, predicate, object))

    assert.strictEqual(result.size, 2)
  })

  it('should call the given function with a context for all added subjects', () => {
    const dataset = rdf.dataset()
    const subjectA = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const subjectB = rdf.namedNode('http://localhost:8080/data/person/penny')
    const predicateA = rdf.namedNode('http://schema.org/knows')
    const predicateB = rdf.namedNode('http://schema.org/saw')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    let result = null

    cf.addIn([predicateA, predicateB], [subjectA, subjectB], child => {
      result = child.values
    })

    assert.deepStrictEqual(result, [subjectA.value, subjectB.value])
  })

  it('should call the given function with a Blank Node context for the created subject', () => {
    const dataset = rdf.dataset()
    const predicate = rdf.namedNode('http://schema.org/knows')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    let result = null

    cf.addIn(predicate, child => {
      result = child
    })

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'BlankNode')
  })

  it('should support clownface objects as predicate and subject', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    cf.addIn(cf.node(predicate), cf.node(subject))

    const result = dataset.match(subject, predicate, object)

    assert.strictEqual(result.size, 1)
  })

  it('should return the called object', () => {
    const dataset = rdf.dataset()
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const object = rdf.namedNode('http://localhost:8080/data/person/mary-cooper')
    const cf = clownface({ dataset, term: object })

    assert.strictEqual(cf.addIn(predicate, subject), cf)
  })

  it('should use the provided factory', () => {
    const dataset = rdf.dataset()
    const predicate = rdf.namedNode('http://schema.org/knows')
    const term = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const factory = new Environment([NamespaceFactory, CustomDataFactory])

    const cf = clownface({ dataset, factory, term }).addIn(predicate, 'test')

    assert.strictEqual(cf.in(predicate).term.testProperty, 'test')
    cf.dataset.match(null, predicate, null).forEach((quad) => {
      assert.strictEqual(quad.testProperty, 'test')
    })
  })

  it('should not add quads if context is undefined', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicate = rdf.namedNode('http://schema.org/knows')

    cf.addIn(predicate, subject)

    assert.strictEqual(dataset.size, 0)
  })

  it('should not call callback function if context is undefined', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })
    const subject = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const predicate = rdf.namedNode('http://schema.org/knows')
    const callback = sinon.spy()

    cf.addIn(predicate, subject, callback)

    assert.strictEqual(callback.called, false)
  })
})
