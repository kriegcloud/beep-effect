import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import Predicate from '../lib/Predicate.js'
import * as ns from './support/namespaces.js'

describe('Predicate', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Predicate, 'function')
  })

  describe('.isType', () => {
    it('should be a property with the value false', () => {
      const predicate = new Predicate({ objects: [], quads: [], term: ns.ex.property })

      strictEqual(predicate.isType, false)
    })

    it('should be true if the term is rdf:type', () => {
      const predicate = new Predicate({ objects: [], quads: [], term: ns.rdf.type })

      strictEqual(predicate.isType, true)
    })
  })

  describe('.objects', () => {
    it('should assign the given map value', () => {
      const objects = [[ns.ex.value, {}]]
      const predicate = new Predicate({ objects, quads: [], term: ns.ex.property })

      strictEqual(predicate.objects.size, 1)
      strictEqual(ns.ex.value.equals([...predicate.objects.keys()][0]), true)
      strictEqual([...predicate.objects.values()][0], objects[0][1])
    })
  })

  describe('.quads', () => {
    it('should assign the given value', () => {
      const quads = []
      const predicate = new Predicate({ objects: [], quads, term: ns.ex.property })

      strictEqual(predicate.quads, quads)
    })
  })

  describe('.term', () => {
    it('should assign the given value', () => {
      const term = ns.ex.property
      const predicate = new Predicate({ objects: [], quads: [], term })

      strictEqual(predicate.term.equals(term), true)
    })
  })
})
