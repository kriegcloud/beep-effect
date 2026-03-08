import { strictEqual } from 'assert'
import DataFactory from '@rdfjs/data-model/Factory.js'
import Environment from '@rdfjs/environment'
import { describe, it } from 'mocha'
import TermSetFactory from '../Factory.js'
import TermSet from '../TermSet.js'

const env = new Environment([DataFactory, TermSetFactory])

describe('Factory', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TermSetFactory, 'function')
  })

  describe('.termSet', () => {
    it('should be a method', () => {
      strictEqual(typeof env.termSet, 'function')
    })

    it('should return a TermSet instance', () => {
      const result = env.termSet()

      strictEqual(result instanceof TermSet, true)
    })

    it('should add the given terms to the set', () => {
      const term0 = env.namedNode('http://example.or/0')
      const term1 = env.namedNode('http://example.or/1')

      const result = env.termSet([term0, term1])

      strictEqual(result.has(term0), true)
      strictEqual(result.has(term1), true)
    })
  })
})
