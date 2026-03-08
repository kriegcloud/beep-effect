/* global describe, it */

import assert from 'assert'
import equals from 'rdf-dataset-ext/equals.js'
import clownface from '../../index.js'
import rdf from '../support/factory.js'

describe('.datasets', () => {
  it('should be an array property', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert(Array.isArray(cf.datasets))
  })

  it('should be empty if there is no context with a dataset', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    cf._context = []

    assert.deepStrictEqual(cf.datasets, [])
  })

  it('should contain all datasets of the context', () => {
    const termA = rdf.literal('1')
    const termB = rdf.namedNode('http://example.org/')
    const datasetA = rdf.dataset()
    const datasetB = rdf.dataset()
    const cf = clownface({ dataset: rdf.dataset(), value: [termA, termB] })

    // TODO: should be possible with constructor or static method
    cf._context[0].dataset = datasetA
    cf._context[1].dataset = datasetB

    const result = cf.datasets

    assert.strictEqual(result.length, 2)
    assert(equals(datasetA, result[0]))
    assert(equals(datasetB, result[1]))
  })
})
