/* global describe, it */

import assert from 'assert'
import clownface from '../index.js'
import { taggedLiteral } from '../filter.js'
import rdf from './support/factory.js'

describe('clownface/filter', () => {
  describe('.taggedLiteral', () => {
    it('should return literals for language', async () => {
      const schemaName = rdf.namedNode('http://schema.org/givenName')
      const cf = clownface({ dataset: rdf.dataset() })
        .blankNode()
        .addOut(schemaName, [
          rdf.literal('Zurich', 'en'),
          rdf.literal('Zürich', 'de'),
          rdf.literal('Zurych', 'pl')])
        .out(schemaName)

      const result = cf.filter(taggedLiteral(['de']))

      assert(result.term.equals(rdf.literal('Zürich', 'de')))
    })

    it('should work with multi-pointer', async () => {
      const containsPlace = rdf.namedNode('http://schema.org/containsPlace')
      const name = rdf.namedNode('http://schema.org/name')
      const cf = clownface({ dataset: rdf.dataset() })
      cf.namedNode('Europe').addOut(containsPlace, [
        cf.namedNode('CH')
          .addOut(name, cf.literal('Switzerland', 'en'))
          .addOut(name, cf.literal('Die Schweiz', 'de')),
        cf.namedNode('PL')
          .addOut(name, cf.literal('Poland', 'en'))
          .addOut(name, cf.literal('Polen', 'de')),
      ])

      const multi = cf.node([rdf.namedNode('CH'), rdf.namedNode('PL')]).out(name)
      const result = multi.filter(taggedLiteral(['de']))

      const terms = rdf.termSet(result.terms)
      assert.strictEqual(result.terms.length, 2)
      assert(terms.has(rdf.literal('Die Schweiz', 'de')))
      assert(terms.has(rdf.literal('Polen', 'de')))
    })

    it('should ignore non-literals', async () => {
      const schemaKnows = rdf.namedNode('http://schema.org/knows')
      const cf = clownface({ dataset: rdf.dataset() })
        .blankNode()
        .addOut(schemaKnows, [rdf.blankNode(), rdf.blankNode()])

      const result = cf.out(schemaKnows).filter(taggedLiteral(['de']))

      assert.strictEqual(result.terms.length, 0)
    })
  })
})
