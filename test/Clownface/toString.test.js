/* global describe, it */

import assert from 'assert'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'

describe('.toString', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.toString, 'function')
  })

  it('should return a string', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.toString(), 'string')
  })

  it('should return the value of a single term', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.out(rdf.namedNode('http://schema.org/givenName')).toString()

    assert.strictEqual(result, 'Bernadette')
  })

  it('should return comma separated values if multiple terms', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: [
        rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
        rdf.namedNode('http://localhost:8080/data/person/howard-wolowitz'),
      ],
    })

    const givenName = cf.out(rdf.namedNode('http://schema.org/givenName')).toString()

    assert.strictEqual(givenName, 'Bernadette,Howard')
  })
})
