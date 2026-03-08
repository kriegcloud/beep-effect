import { strictEqual } from 'assert'
import rdf from '@rdfjs/data-model'
import toNT from '@rdfjs/to-ntriples'
import { describe, it } from 'mocha'
import TermMap from '../TermMap.js'

describe('@rdfjs/term-map', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TermMap, 'function')
  })

  describe('.size', () => {
    it('should be a number property', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.size, 'number')
    })

    it('should return the size of the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap([[term, null]])

      strictEqual(termmap.size, 1)
    })
  })

  describe('.clear', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.clear, 'function')
    })

    it('should clear the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap([[term, null]])

      termmap.clear()

      strictEqual(termmap.index.size, 0)
    })
  })

  describe('.delete', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.delete, 'function')
    })

    it('should delete the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, null], [term1, null]])

      termmap.delete(term1)

      strictEqual(termmap.index.size, 1)
      strictEqual(term0.equals([...termmap.index.values()][0].term), true)
    })

    it('should delete the given Quad term', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term0 = rdf.quad(subject, predicate, object)
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, null], [term1, null]])

      termmap.delete(term0)

      strictEqual(termmap.index.size, 1)
      strictEqual(term1.equals([...termmap.index.values()][0].term), true)
    })

    it('should return true if the given term was deleted', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap([[term, null]])

      strictEqual(termmap.delete(term), true)
    })

    it('should return false if the given term was not deleted', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap()

      strictEqual(termmap.delete(term), false)
    })
  })

  describe('.entries', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.entries, 'function')
    })

    it('should return an iterator that contains all entries', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const entries = [...termmap.entries()]

      strictEqual(entries.length, 2)
      strictEqual(term0.equals(entries[0][0]), true)
      strictEqual(entries[0][1], 0)
      strictEqual(term1.equals(entries[1][0]), true)
      strictEqual(entries[1][1], 1)
    })
  })

  describe('.forEach', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.forEach, 'function')
    })

    it('should loop over all entries in insertion order', () => {
      const data = []
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      termmap.forEach((value, term, map) => {
        strictEqual(map, termmap)
        data.push({ term, value })
      })

      strictEqual(data.length, 2)
      strictEqual(term0.equals(data[0].term), true)
      strictEqual(data[0].value, 0)
      strictEqual(term1.equals(data[1].term), true)
      strictEqual(data[1].value, 1)
    })
  })

  describe('.get', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.get, 'function')
    })

    it('should return the value for the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const result = termmap.get(term1)

      strictEqual(result, 1)
    })

    it('should return the value for the given Quad term', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term0 = rdf.quad(subject, predicate, object)
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const result = termmap.get(term0)

      strictEqual(result, 0)
    })

    it('should return undefined if there is no value for the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0]])

      const result = termmap.get(term1)

      strictEqual(typeof result, 'undefined')
    })
  })

  describe('.has', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.has, 'function')
    })

    it('should return true if it contains the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      strictEqual(termmap.has(term1), true)
    })

    it('should return true if it contains the given Quad term', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term0 = rdf.quad(subject, predicate, object)
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      strictEqual(termmap.has(term0), true)
    })

    it('should return false if it doesn\'t contain the given term', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0]])

      strictEqual(termmap.has(term1), false)
    })
  })

  describe('.keys', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.keys, 'function')
    })

    it('should return an iterator that contains all terms', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const values = [...termmap.keys()]

      strictEqual(values.length, 2)
      strictEqual(term0.equals(values[0]), true)
      strictEqual(term1.equals(values[1]), true)
    })
  })

  describe('.set', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.set, 'function')
    })

    it('should add the given entry to the index', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap()

      termmap.set(term, 1)

      const entries = [...termmap.index]

      strictEqual(entries.length, 1)
      strictEqual(entries[0][0], toNT(term))
      strictEqual(term.equals(entries[0][1].term), true)
      strictEqual(entries[0][1].value, 1)
    })

    it('should add the given Quad entry to the index', () => {
      const subject = rdf.blankNode()
      const predicate = rdf.namedNode('http://example.org/predicate')
      const object = rdf.literal('example')
      const term = rdf.quad(subject, predicate, object)
      const termmap = new TermMap()

      termmap.set(term, 1)

      const entries = [...termmap.index]

      strictEqual(entries.length, 1)
      strictEqual(entries[0][0], toNT(term))
      strictEqual(term.equals(entries[0][1].term), true)
      strictEqual(entries[0][1].value, 1)
    })

    it('should update an entry if another one with the same N-Triple representation is added', () => {
      const term0 = rdf.namedNode('http://example.org/')
      const term1 = rdf.namedNode(term0.value)
      const termmap = new TermMap()

      termmap.set(term0, 0)
      termmap.set(term1, 1)

      const entries = [...termmap.index]

      strictEqual(entries.length, 1)
      strictEqual(entries[0][0], toNT(term0))
      strictEqual(term0.equals(entries[0][1].term), true)
      strictEqual(entries[0][1].value, 1)
    })

    it('should return itself', () => {
      const term = rdf.namedNode('http://example.org/')
      const termmap = new TermMap()

      strictEqual(termmap.set(term, 0), termmap)
    })
  })

  describe('.values', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap.values, 'function')
    })

    it('should return an iterator that contains all values', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const values = [...termmap.values()]

      strictEqual(values.length, 2)
      strictEqual(values[0], 0)
      strictEqual(values[1], 1)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be a method', () => {
      const termmap = new TermMap()

      strictEqual(typeof termmap[Symbol.iterator], 'function')
    })

    it('should return an iterator that contains all entries', () => {
      const term0 = rdf.namedNode('http://example.org/0')
      const term1 = rdf.namedNode('http://example.org/1')
      const termmap = new TermMap([[term0, 0], [term1, 1]])

      const entries = [...termmap]

      strictEqual(entries.length, 2)
      strictEqual(term0.equals(entries[0][0]), true)
      strictEqual(entries[0][1], 0)
      strictEqual(term1.equals(entries[1][0]), true)
      strictEqual(entries[1][1], 1)
    })
  })
})
