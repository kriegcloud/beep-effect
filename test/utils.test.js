import { strictEqual } from 'assert'
import rdf from '@rdfjs/data-model'
import { describe, it } from 'mocha'
import { isBoolean, isDecimal, isDouble, isLangString, isInteger, isString } from '../lib/utils.js'
import * as ns from './support/namespaces.js'

describe('utils', () => {
  describe('isBoolean', () => {
    it('should be a function', () => {
      strictEqual(typeof isBoolean, 'function')
    })

    it('should return true if the given term is a xsd:boolean literal', () => {
      const term = rdf.literal('true', ns.xsd.boolean)

      strictEqual(isBoolean(term), true)
    })
  })

  describe('isDecimal', () => {
    it('should be a function', () => {
      strictEqual(typeof isDecimal, 'function')
    })

    it('should return true if the given term is a xsd:decimal literal', () => {
      const term = rdf.literal('12.34', ns.xsd.decimal)

      strictEqual(isDecimal(term), true)
    })
  })

  describe('isDouble', () => {
    it('should be a function', () => {
      strictEqual(typeof isDouble, 'function')
    })

    it('should return true if the given term is a xsd:double literal', () => {
      const term = rdf.literal('1.2E3', ns.xsd.double)

      strictEqual(isDouble(term), true)
    })
  })

  describe('isLangString', () => {
    it('should be a function', () => {
      strictEqual(typeof isLangString, 'function')
    })

    it('should return true if the given term is a rdf:langString literal', () => {
      const term = rdf.literal('Hello World!', 'en')

      strictEqual(isLangString(term), true)
    })
  })

  describe('isInteger', () => {
    it('should be a function', () => {
      strictEqual(typeof isInteger, 'function')
    })

    it('should return true if the given term is a xsd:integer literal', () => {
      const term = rdf.literal('1234', ns.xsd.integer)

      strictEqual(isInteger(term), true)
    })
  })

  describe('isString', () => {
    it('should be a function', () => {
      strictEqual(typeof isString, 'function')
    })

    it('should return true if the given term is a xsd:string literal', () => {
      const term = rdf.literal('Hello World!')

      strictEqual(isString(term), true)
    })
  })
})
