import { strictEqual } from 'assert'
import DataFactory from '@rdfjs/data-model/Factory.js'
import Environment from '@rdfjs/environment'
import { describe, it } from 'mocha'
import NamespaceFactory from '../Factory.js'

const env = new Environment([DataFactory, NamespaceFactory])

describe('NamespaceFactory', () => {
  it('should be a constructor', () => {
    strictEqual(typeof NamespaceFactory, 'function')
  })

  describe('.namespace', () => {
    it('should be a method', () => {
      strictEqual(typeof env.namespace, 'function')
    })

    it('should return a namespace builder', () => {
      const ns = env.namespace('http://example.org/')

      const result = ns.test

      strictEqual(result.termType, 'NamedNode')
    })

    it('should use the given baseURL', () => {
      const ns = env.namespace('http://example.org/')

      const result = ns.test

      strictEqual(result.value, 'http://example.org/test')
    })
  })
})
