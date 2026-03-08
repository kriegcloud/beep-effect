/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import rdf from '../support/factory.js'

describe('.dataset', () => {
  it('should be undefined if there is no context with a dataset', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    cf._context = []

    assert.strictEqual(typeof cf.dataset, 'undefined')
  })

  it('should be the dataset of the context if there is only one dataset', () => {
    const dataset = rdf.dataset()
    const cf = clownface({ dataset })

    assert.strictEqual(cf.dataset, dataset)
  })

  it('should be undefined if there are multiple datasets in the context', () => {
    const termA = rdf.literal('1')
    const termB = rdf.namedNode('http://example.org/')
    const datasetA = rdf.dataset()
    const datasetB = rdf.dataset()
    const cf = clownface({ dataset: rdf.dataset(), value: [termA, termB] })

    // TODO: should be possible with constructor or static method
    cf._context[0].dataset = datasetA
    cf._context[1].dataset = datasetB

    assert.strictEqual(typeof cf.dataset, 'undefined')
  })
})
