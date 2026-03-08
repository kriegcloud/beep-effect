import { strictEqual } from 'assert'
import TermMap from '@rdfjs/term-map'
import { describe, it } from 'mocha'
import Tree from '../lib/Tree.js'
import { testTree } from './support/testTree.js'

describe('Tree', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Tree, 'function')
  })

  describe('.nodes', () => {
    it('should be a TermMap property', () => {
      const tree = new Tree([])

      strictEqual(tree.nodes instanceof TermMap, true)
    })
  })

  describe('.objects', () => {
    it('should be a TermMap property', () => {
      const tree = new Tree()

      strictEqual(tree.objects instanceof TermMap, true)
    })
  })

  describe('.subjects', () => {
    it('should be a TermMap property', () => {
      const tree = new Tree()

      strictEqual(tree.subjects instanceof TermMap, true)
    })
  })

  describe('', () => {
    it('should parse lists', async () => {
      const expected = {
        objects: [{
          term: ''
        }, {
          term: ''
        }, {
          term: ''
        }, {
          term: ''
        }, {
          term: '""'
        }, {
          term: '"a"'
        }, {
          term: '"b"'
        }, {
          term: '"c"'
        }, {
          term: '"d"'
        }, {
          term: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#nil>'
        }],
        subjects: [{
          isListValue: true,
          items: '',
          lists: '',
          predicates: '<http://example.org/propertyF>',
          term: ''
        }, {
          isListValue: false,
          items: '',
          lists: '',
          predicates: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>',
          term: ''
        }, {
          isListValue: false,
          items: '',
          lists: '',
          predicates: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>',
          term: ''
        }, {
          isListValue: false,
          items: '"a" "b"',
          lists: '',
          predicates: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>',
          term: ''
        }, {
          isListValue: false,
          items: '"c" ',
          lists: '',
          predicates: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>',
          term: ''
        }, {
          isListValue: false,
          items: '',
          lists: '<http://example.org/propertyC> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil>,<http://example.org/propertyD> _:,<http://example.org/propertyE> _:',
          predicates: '<http://example.org/propertyA> <http://example.org/propertyB> <http://example.org/propertyC> <http://example.org/propertyD> <http://example.org/propertyE>',
          term: '<http://example.org/resource>'
        }]
      }

      await testTree('lists', expected)
    })

    it('should parse multiple objects', async () => {
      const expected = {
        objects: [{
          term: '"a"'
        }, {
          term: '"b"'
        }],
        subjects: [{
          isListValue: false,
          items: '',
          lists: '',
          predicates: '<http://example.org/propertyA>',
          term: '<http://example.org/resource>'
        }]
      }

      await testTree('objects', expected)
    })

    it('should parse type', async () => {
      const expected = {
        objects: [{
          term: '<http://example.org/Resource>'
        }],
        subjects: [{
          isListValue: false,
          items: '',
          lists: '',
          predicates: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
          term: '<http://example.org/resource>'
        }]
      }

      await testTree('type', expected)
    })
  })
})
