import { strictEqual, throws } from 'assert'
import rdf from '@rdfjs/data-model'
import toNT from '@rdfjs/to-ntriples'
import { describe, it } from 'mocha'
import TermSet from '../TermSet.js'

describe('@rdfjs/term-set', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TermSet, 'function')
  })

  describe('.size', () => {
    it('should be a number property', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.size, 'number')
    })

    it('should return the size of the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet([term])

      strictEqual(termset.size, 1)
    })
  })

  describe('.add', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.add, 'function')
    })

    it('should add the given term to the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet()

      termset.add(term)

      strictEqual([...termset.index.values()][0], term)
      strictEqual([...termset.index.keys()][0], toNT(term))
    })

    it('should add the given Quad term to the index', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term = rdf.quad(subject, predicate, object)
      const termset = new TermSet()

      termset.add(term)

      strictEqual([...termset.index.values()][0], term)
      strictEqual([...termset.index.keys()][0], toNT(term))
    })

    it('should keep the term if another one with the same N-Triple representation is added', () => {
      const term0 = rdf.namedNode('http://example.org/')
      const term1 = rdf.namedNode(term0.value)
      const termset = new TermSet()

      termset.add(term0)
      termset.add(term1)

      strictEqual(termset.index.size, 1)
      strictEqual(term0.equals([...termset.index.values()][0]), true)
    })

    it('should return the Termset itself', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet()

      termset.add(term)

      strictEqual(termset.add(term), termset)
    })

    it('should throw an error if a non-Term object is given', () => {
      const termset = new TermSet()

      throws(() => {
        termset.add({})
      })
    })
  })

  describe('.clear', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.clear, 'function')
    })

    it('should clear the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet([term])

      termset.clear()

      strictEqual(termset.index.size, 0)
    })
  })

  describe('.delete', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.delete, 'function')
    })

    it('should delete the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      termset.delete(term1)

      strictEqual(termset.index.size, 1)
      strictEqual(term0.equals([...termset.index.values()][0]), true)
    })

    it('should delete the given Quad term', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term0 = rdf.quad(subject, predicate, object)
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      termset.delete(term0)

      strictEqual(termset.index.size, 1)
      strictEqual(term1.equals([...termset.index.values()][0]), true)
    })

    it('should return true if the given term was deleted', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet([term])

      strictEqual(termset.delete(term), true)
    })

    it('should return false if the given term was not deleted', () => {
      const term = rdf.namedNode('http://example.org/')
      const termset = new TermSet()

      strictEqual(termset.delete(term), false)
    })

    it('should return false if null is given', () => {
      const termset = new TermSet()

      strictEqual(termset.delete(null), false)
    })

    it('should return false if a non-Term object is given', () => {
      const termset = new TermSet()

      strictEqual(termset.delete({}), false)
    })
  })

  describe('.entries', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.entries, 'function')
    })

    it('should return an iterator that contains an array element [term, term] for each term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      const entries = [...termset.entries()]

      strictEqual(entries.length, 2)
      strictEqual(term0.equals(entries[0][0]), true)
      strictEqual(term0.equals(entries[0][1]), true)
      strictEqual(term1.equals(entries[1][0]), true)
      strictEqual(term1.equals(entries[1][1]), true)
    })
  })

  describe('.forEach', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.forEach, 'function')
    })

    it('should loop over all terms in insertion order', () => {
      const terms = []
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      termset.forEach(term => {
        terms.push(term)
      })

      strictEqual(terms.length, 2)
      strictEqual(term0.equals(terms[0]), true)
      strictEqual(term1.equals(terms[1]), true)
    })
  })

  describe('.has', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.has, 'function')
    })

    it('should return true if the Termset contains the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      strictEqual(termset.has(term1), true)
    })

    it('should return true if the Termset contains the given Quad term', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term0 = rdf.quad(subject, predicate, object)
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      strictEqual(termset.has(term0), true)
    })

    it('should return false if the Termset does not contain the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0])

      strictEqual(termset.has(term1), false)
    })

    it('should return false if null is given', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      strictEqual(termset.has(null), false)
    })

    it('should return false if a non-Term object is given', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      strictEqual(termset.has({}), false)
    })
  })

  describe('.values', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.values, 'function')
    })

    it('should return an iterator that contains all terms', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      const values = [...termset.values()]

      strictEqual(values.length, 2)
      strictEqual(term0.equals(values[0]), true)
      strictEqual(term1.equals(values[1]), true)
    })
  })

  describe('.keys', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset.keys, 'function')
    })

    it('should return an iterator that contains all terms', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      const values = [...termset.keys()]

      strictEqual(values.length, 2)
      strictEqual(term0.equals(values[0]), true)
      strictEqual(term1.equals(values[1]), true)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be a method', () => {
      const termset = new TermSet()

      strictEqual(typeof termset[Symbol.iterator], 'function')
    })

    it('should return an iterator that contains all terms', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termset = new TermSet([term0, term1])

      const terms = [...termset]

      strictEqual(terms.length, 2)
      strictEqual(term0.equals(terms[0]), true)
      strictEqual(term1.equals(terms[1]), true)
    })
  })
})
