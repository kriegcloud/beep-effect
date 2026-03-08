/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.has', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.has, 'function')
  })

  it('should return a new Dataset instance', async () => {
    const predicate = rdf.namedNode('http://schema.org/givenName')
    const cf = clownface({ dataset: await loadExample() })

    const result = cf.has(predicate, 'Stuart')

    assert(result instanceof Clownface)
    assert.notStrictEqual(result, cf)
  })

  it('should use the dataset from the context', async () => {
    const dataset = await loadExample()
    const predicate = rdf.namedNode('http://schema.org/givenName')
    const cf = clownface({ dataset })

    const result = cf.has(predicate, 'Stuart')

    assert.strictEqual(result._context[0].dataset, dataset)
  })

  it('should use the found subject in the context', async () => {
    const subject = rdf.namedNode('http://localhost:8080/data/person/stuart-bloom')
    const predicate = rdf.namedNode('http://schema.org/givenName')
    const cf = clownface({ dataset: await loadExample() })

    const result = cf.has(predicate, 'Stuart')

    assert.strictEqual(result._context.length, 1)
    assert(subject.equals(result._context[0].term))
  })

  it('should support multiple predicates in an array', async () => {
    const predicateA = rdf.namedNode('http://schema.org/knows')
    const predicateB = rdf.namedNode('http://schema.org/spouse')
    const object = rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski')
    const cf = clownface({ dataset: await loadExample() })

    const result = cf.has([predicateA, predicateB], object)

    assert.strictEqual(result._context.length, 8)
  })

  it('should support multiple predicates in an array', async () => {
    const predicate = rdf.namedNode('http://schema.org/givenName')
    const objectA = rdf.literal('Leonard')
    const objectB = rdf.literal('Sheldon')
    const cf = clownface({ dataset: await loadExample() })

    const result = cf.has(predicate, [objectA, objectB])

    assert.strictEqual(result._context.length, 2)
  })

  it('should use context term as subject', async () => {
    const subjectA = rdf.namedNode('http://localhost:8080/data/person/sheldon-cooper')
    const subjectB = rdf.namedNode('http://localhost:8080/data/person/stuart-bloom')
    const predicate = rdf.namedNode('http://schema.org/givenName')
    const objects = [
      rdf.literal('Leonard'),
      rdf.literal('Sheldon'),
    ]

    const cf = clownface({ dataset: await loadExample(), term: [subjectA, subjectB] })

    const result = cf.has(predicate, objects)

    assert.strictEqual(result._context.length, 1)
    assert(result._context[0].term.equals(subjectA))
  })
})
