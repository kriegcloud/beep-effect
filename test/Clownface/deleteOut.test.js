/* global describe, it */

import assert from 'assert'
import { addAll } from 'rdf-dataset-ext'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import * as ns from '../support/namespace.js'
import rdf from '../support/factory.js'

describe('.deleteOut', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.deleteOut, 'function')
  })

  it('should return the called object', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({ dataset })

    assert.strictEqual(cf.deleteOut(), cf)
  })

  it('should remove quads based on the object value', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.deleteOut()

    assert.strictEqual(dataset.size, 113)
  })

  it('should remove quads based on the object value and predicate', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.deleteOut(rdf.namedNode('http://schema.org/knows'))

    assert.strictEqual(dataset.size, 119)
  })

  it('should remove quads based on the object value and multiple predicates', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.deleteOut([
      rdf.namedNode('http://schema.org/knows'),
      rdf.namedNode('http://schema.org/spouse'),
    ])

    assert.strictEqual(dataset.size, 118)
  })

  it('should remove quads based on the object value and predicate', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.deleteOut(rdf.namedNode('http://schema.org/knows'))

    assert.strictEqual(dataset.size, 119)
  })

  it('should remove quads based on the object value, predicate and object', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: ns.tbbtp('bernadette-rostenkowski'),
    })

    cf.deleteOut(ns.schema.knows, ns.tbbtp('amy-farrah-fowler'))

    assert.strictEqual(dataset.size, 125)
  })

  it('should remove quads based on the object value, multiple predicates and multiple objects', async () => {
    const dataset = addAll(rdf.dataset(), await loadExample())
    const cf = clownface({
      dataset,
      term: ns.tbbtp('bernadette-rostenkowski'),
    })

    cf.deleteOut([ns.schema.knows, ns.schema.spouse], [ns.tbbtp('amy-farrah-fowler'), ns.tbbtp('howard-wolowitz')])

    assert.strictEqual(dataset.size, 123)
  })
})
