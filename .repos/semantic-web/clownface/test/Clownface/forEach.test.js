import assert from 'assert'
import { describe, it } from 'mocha'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'

describe('.forEach', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.forEach, 'function')
  })

  it('should call the function with Dataset parameter', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    cf.in(rdf.namedNode('http://schema.org/knows')).forEach(item => {
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

    cf.in(rdf.namedNode('http://schema.org/knows')).forEach(() => {
      count++

      return true
    })

    assert.strictEqual(count, 7)
  })

  it('should return self', () => {
    const cf = clownface({
      dataset: rdf.dataset(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const forEachReturned = cf.forEach(() => {})

    assert.strictEqual(forEachReturned, cf)
  })
})
