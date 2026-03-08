/* global describe, it */

import assert from 'assert'
import namespace from '@rdfjs/namespace'
import { booleanToLiteral, numberToLiteral, stringToLiteral, toLiteral } from '../lib/fromPrimitive.js'
import rdf from './support/factory.js'

const xsd = namespace('http://www.w3.org/2001/XMLSchema#')

describe('fromPrimitive', () => {
  describe('booleanToLiteral', () => {
    it('is function', () => {
      assert.strictEqual(typeof booleanToLiteral, 'function')
    })

    it('returns null if non boolean value is given', () => {
      assert.strictEqual(booleanToLiteral(3), null)
    })

    it('returns Literal with xsd:boolean datatype for true value', () => {
      assert(rdf.literal('true', xsd.boolean), booleanToLiteral(true))
    })

    it('returns Literal with xsd:boolean datatype for false value', () => {
      assert(rdf.literal('false', xsd.boolean), booleanToLiteral(false))
    })
  })

  describe('numberToLiteral', () => {
    it('is function', () => {
      assert.strictEqual(typeof numberToLiteral, 'function')
    })

    it('returns null if non number value is given', () => {
      assert.strictEqual(numberToLiteral(true), null)
    })

    it('returns Literal with xsd:double datatype for number value', () => {
      assert(rdf.literal('3.21', xsd.double).equals(numberToLiteral(3.21)))
    })

    it('returns Literal with xsd:integer datatype for a number value that is an integer', () => {
      assert(rdf.literal('321', xsd.integer).equals(numberToLiteral(321)))
    })
  })

  describe('stringToLiteral', () => {
    it('is function', () => {
      assert.strictEqual(typeof stringToLiteral, 'function')
    })

    it('returns null if non string value is given', () => {
      assert.strictEqual(stringToLiteral(true), null)
    })

    it('returns Literal', () => {
      assert(rdf.literal('M42').equals(stringToLiteral('M42')))
    })
  })

  describe('toLiteral', () => {
    it('is function', () => {
      assert.strictEqual(typeof toLiteral, 'function')
    })

    it('returns null if a value with an unknown type is given', () => {
      assert.strictEqual(toLiteral({}), null)
    })

    it('returns Literal with xsd:boolean datatype for a boolean value', () => {
      assert(rdf.literal('true', xsd.boolean), toLiteral(true))
    })

    it('returns Literal with xsd:double datatype for a number value', () => {
      assert(rdf.literal('3.21', xsd.double).equals(toLiteral(3.21)))
    })

    it('returns Literal', () => {
      assert(rdf.literal('M42').equals(toLiteral('M42')))
    })
  })
})
