import assert from 'assert'
import { describe, it } from 'mocha'
import clownface from '../../index.js'
import loadExample from '../support/example.js'
import rdf from '../support/factory.js'
import Clownface from '../../lib/Clownface.js'
import * as ns from '../support/namespace.js'
import parse from '../support/parse.js'

describe('.out', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.out, 'function')
  })

  it('should return a new Clownface instance', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/amy-farrah-fowler'),
    })

    const result = cf.out(rdf.namedNode('http://schema.org/jobTitle'))

    assert(result instanceof Clownface)
    assert.notStrictEqual(result, cf)
  })

  it('should search subject -> object without predicate', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: ns.tbbtp('amy-farrah-fowler'),
    })

    const result = cf.out()

    assert.strictEqual(result._context.length, 12)
  })

  it('should search subject -> object with predicate', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/amy-farrah-fowler'),
    })

    const result = cf.out(rdf.namedNode('http://schema.org/jobTitle'))

    assert.strictEqual(result._context.length, 1)
    assert.strictEqual(result._context[0].term.termType, 'Literal')
    assert.strictEqual(result._context[0].term.value, 'neurobiologist')
  })

  it('should support multiple predicate values in an array', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.out([
      rdf.namedNode('http://schema.org/familyName'),
      rdf.namedNode('http://schema.org/givenName'),
    ])

    assert.strictEqual(result._context.length, 2)
  })

  it('should support clownface objects as predicates', async () => {
    const cf = clownface({
      dataset: await loadExample(),
      term: rdf.namedNode('http://localhost:8080/data/person/bernadette-rostenkowski'),
    })

    const result = cf.out(cf.node([
      rdf.namedNode('http://schema.org/familyName'),
      rdf.namedNode('http://schema.org/givenName'),
    ]))

    assert.strictEqual(result._context.length, 2)
  })

  describe('with language option', () => {
    const testData = `<${ns.ex.ananas.value}>
      <${ns.rdfs.label.value}> "Pineapple" ;
      <${ns.rdfs.label.value}> "Ananas"@pl ;
      <${ns.rdfs.label.value}> "Ananas"@de ;
      <${ns.rdfs.label.value}> "Ananász"@hu ;
      <${ns.rdfs.label.value}> "Ananas"@sr-Latn ;
      <${ns.rdfs.label.value}> "Ананас"@sr-Cyrl ;
    .
    
    <${ns.ex.noLabels.value}> <${ns.rdfs.label.value}> _:foo , <${ns.ex.bar.value.value}>, 41 .
    
    <${ns.ex.apple.value}>
      <${ns.rdfs.label.value}> "Apple"@en ;
      <${ns.rdfs.label.value}> "Apfel"@de ;
      <${ns.rdfs.label.value}> "Јабука"@sr-Cyrl .
      
    <${ns.ex.carrot.value}>
      <${ns.rdfs.label.value}> "Karotte"@de ;
      <${ns.rdfs.label.value}> "Karotte"@de-AT ;
      <${ns.rdfs.label.value}> "Rüebli"@de-CH ;
    .
    
    <${ns.ex.eggplant.value}>
      <${ns.rdfs.label.value}> "Psianka podłużna"@pl, "Bakłażan"@pl, "Oberżyna"@pl .
      
    <${ns.ex.kongressstrasse.value}> 
      <${ns.rdfs.label.value}> "Kongressstraße"@de ;
      <${ns.rdfs.label.value}> "Kongreßstraße"@de-DE-1901 ;
    .`.toString()

    describe('filtered by single language parameter', () => {
      it('should not return non-literals and non-string literals when language parameter is defined', async () => {
        const apple = (await parse(testData)).node(ns.ex.noLabels)

        const label = apple.out(ns.rdfs.label, { language: '' })

        assert.strictEqual(label.terms.length, 0)
      })

      it('should return exact match for given language', async () => {
        const apple = (await parse(testData)).node(ns.ex.apple)

        const label = apple.out(ns.rdfs.label, { language: 'de' })

        assert(label.term.equals(rdf.literal('Apfel', 'de')))
      })

      it('should return plain string when language is empty string', async () => {
        const apple = (await parse(testData)).node(ns.ex.ananas)

        const label = apple.out(ns.rdfs.label, { language: '' })

        assert(label.term.equals(rdf.literal('Pineapple')))
      })

      it('should skip pointers which do not have matching language', async () => {
        const apple = (await parse(testData)).node(ns.ex.ananas)

        const label = apple.out(ns.rdfs.label, { language: 'en' })

        assert.strictEqual(label.values.length, 0)
      })

      it('should return any result for wildcard language', async () => {
        const apple = (await parse(testData)).node(ns.ex.ananas)

        const label = apple.out(ns.rdfs.label, { language: '*' })

        assert.ok(label.term)
      })

      it('should return all matching literals for a language', async () => {
        const apple = (await parse(testData)).node(ns.ex.eggplant)

        const label = apple.out(ns.rdfs.label, { language: 'pl' })

        assert.strictEqual(label.terms.length, 3)
      })

      it('should return all matching literals for a wildcard language', async () => {
        const apple = (await parse(testData)).node(ns.ex.eggplant)

        const label = apple.out(ns.rdfs.label, { language: '*' })

        assert.strictEqual(label.terms.length, 3)
      })

      it('should be case-insensitive', async () => {
        const apple = (await parse(testData)).node(ns.ex.apple)

        const label = apple.out(ns.rdfs.label, { language: 'SR-cyrl' })

        assert(label.term.equals(rdf.literal('Јабука', 'sr-Cyrl')))
      })

      it('should match secondary language tag by primary', async () => {
        const apple = (await parse(testData)).node(ns.ex.apple)

        const label = apple.out(ns.rdfs.label, { language: 'sr' })

        assert(label.term.equals(rdf.literal('Јабука', 'sr-Cyrl')))
      })

      it('should match secondary language tag by primary regardless of case', async () => {
        const apple = (await parse(testData)).node(ns.ex.apple)

        const label = apple.out(ns.rdfs.label, { language: 'SR' })

        assert(label.term.equals(rdf.literal('Јабука', 'sr-Cyrl')))
      })

      it('should match tertiary tag by secondary language', async () => {
        const apple = (await parse(testData)).node(ns.ex.kongressstrasse)

        const label = apple.out(ns.rdfs.label, { language: 'de-DE' })

        assert(label.term.equals(rdf.literal('Kongreßstraße', 'de-DE-1901')))
      })
    })

    describe('filtered by multiple languages', () => {
      it('should choose first match', async () => {
        const apple = (await parse(testData)).node(ns.ex.apple)

        const label = apple.out(ns.rdfs.label, { language: ['fr', 'no', 'be', 'en', 'de'] })

        assert(label.term.equals(rdf.literal('Apple', 'en')))
      })

      it('should choose exact match over secondary language', async () => {
        const apple = (await parse(testData)).node(ns.ex.carrot)

        const label = apple.out(ns.rdfs.label, { language: ['de-1901', 'de'] })

        assert(label.term.equals(rdf.literal('Karotte', 'de')))
      })
    })
  })
})
