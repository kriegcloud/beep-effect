import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import language from '../language.js'
import sort from '../sort.js'
import rdf from './support/factory.js'

describe('language', () => {
  it('should be a function', () => {
    strictEqual(typeof language, 'function')
  })

  it('should return a score function', () => {
    const score = language([])

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = language([])

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score language literals based on the index of the given languages', () => {
    const score = language(['en', 'de'])
    const dataset = rdf.dataset()
    const terms = [
      rdf.literal('test', 'de'),
      rdf.literal('test', 'en')
    ]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].score, 1)
    strictEqual(result[0].term.equals(terms[1]), true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].score, 0.5)
    strictEqual(result[1].term.equals(terms[0]), true)
  })

  it('should score unknown languages based on the index of the wildcard', () => {
    const score = language(['en', '*'])
    const dataset = rdf.dataset()
    const terms = [
      rdf.literal('test', 'de'),
      rdf.literal('test', 'en')
    ]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].score, 1)
    strictEqual(result[0].term.equals(terms[1]), true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].score, 0.5)
    strictEqual(result[1].term.equals(terms[0]), true)
  })

  it('should score empty languages based on the index of the wildcard', () => {
    const score = language(['en', '*'])
    const dataset = rdf.dataset()
    const terms = [
      rdf.literal('test', ''),
      rdf.literal('test', 'en')
    ]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].score, 1)
    strictEqual(result[0].term.equals(terms[1]), true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].score, 0.5)
    strictEqual(result[1].term.equals(terms[0]), true)
  })
})
