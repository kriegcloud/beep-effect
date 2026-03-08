/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import rdf from '../support/factory.js'

describe('.term', () => {
  it('should be undefined if there is no context with a term', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.term, 'undefined')
  })

  it('should be the term of the context if there is only one term', () => {
    const term = rdf.literal('1')
    const cf = clownface({ dataset: rdf.dataset(), term })

    assert(term.equals(cf.term))
  })

  it('should be undefined if there are multiple terms in the context', () => {
    const termA = rdf.literal('1')
    const termB = rdf.namedNode('http://example.org/')

    const cf = clownface({ dataset: rdf.dataset(), term: [termA, termB] })

    assert.strictEqual(typeof cf.term, 'undefined')
  })
})
