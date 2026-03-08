/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'
import Context from '../../lib/Context.js'

describe('.filter', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.filter, 'function')
  })

  it('should return a Dataset instance', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert(cf.filter(() => true) instanceof Clownface)
  })

  it('should return instance with _context of correct type', () => {
    const cf = clownface({ dataset: rdf.dataset() }).namedNode()

    const [context] = cf.filter(() => true)._context

    assert(context instanceof Context)
  })

  it('should call the function with Dataset parameter', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.in(rdf.namedNode('http://schema.org/knows')).filter(item => {
      assert(item instanceof Clownface)

      return true
    })
  })

  it('should call the function for each context', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    let count = 0

    cf.in(rdf.namedNode('http://schema.org/knows')).filter(() => {
      count++

      return true
    })

    assert.strictEqual(count, 7)
  })

  it('should filter the context based on the return value of the function', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.in(rdf.namedNode('http://schema.org/knows')).filter(item => {
      return !item.terms.every(term => {
        return term.equals(rdf.namedNode('http://localhost:8080/data/person/howard-wolowitz'))
      })
    })

    assert.strictEqual(result._context.length, 6)
  })
})
