import { strictEqual } from 'assert'
import TermMap from '@rdfjs/term-map'
import { describe, it } from 'mocha'
import Node from '../lib/Node.js'
import * as ns from './support/namespaces.js'

describe('Node', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Node, 'function')
  })

  describe('.item', () => {
    it('should be the Node linked with the property rdf:first', () => {
      const node = new Node()
      node.predicates.set(ns.rdf.first, {
        objects: new TermMap([[ns.ex.item, { term: ns.ex.item }]])
      })

      const result = node.item

      strictEqual(ns.ex.item.equals(result.term), true)
    })

    it('should be undefined if there is no rdf:first predicate', () => {
      const node = new Node()

      strictEqual(node.item, undefined)
    })

    it('should be undefined if there are multiple rdf:first predicates', () => {
      const node = new Node()
      node.predicates.set(ns.rdf.first, {
        objects: [ns.ex.item1, ns.ex.item2]
      })

      strictEqual(node.item, undefined)
    })
  })

  describe('.items', () => {
    it('should be a property with the value null', () => {
      const node = new Node()

      strictEqual(node.items, null)
    })
  })

  describe('.isListItem', () => {
    it('should be a property with the value false', () => {
      const node = new Node()

      strictEqual(node.isListItem, false)
    })
  })

  describe('.isListValue', () => {
    it('should be a property with the value false', () => {
      const node = new Node()

      strictEqual(node.isListValue, false)
    })
  })

  describe('.isSubject', () => {
    it('should be a property with the value false', () => {
      const node = new Node()

      strictEqual(node.isSubject, false)
    })

    it('should assign the given value', () => {
      const node = new Node({ isSubject: true })

      strictEqual(node.isSubject, true)
    })
  })

  describe('.predicates', () => {
    it('should be a TermMap property', () => {
      const node = new Node()

      strictEqual(node.predicates instanceof TermMap, true)
    })
  })

  describe('.quads', () => {
    it('should be an Array property', () => {
      const node = new Node()

      strictEqual(Array.isArray(node.quads), true)
    })
  })

  describe('.refs', () => {
    it('should be an Array property', () => {
      const node = new Node()

      strictEqual(Array.isArray(node.refs), true)
    })
  })

  describe('.term', () => {
    it('should be the given Term', () => {
      const term = ns.ex.resource
      const node = new Node({ term })

      strictEqual(term.equals(node.term), true)
    })
  })

  describe('.type', () => {
    it('should be a property with the value null', () => {
      const node = new Node()

      strictEqual(node.type, null)
    })

    it('should assign the given value', () => {
      const node = new Node()
      const type = {}

      node.type = type

      strictEqual(node.type, type)
    })
  })
})
