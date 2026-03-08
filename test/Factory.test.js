import { strictEqual } from 'assert'
import DataFactory from '@rdfjs/data-model/Factory.js'
import Environment from '@rdfjs/environment'
import { describe, it } from 'mocha'
import TermMapFactory from '../Factory.js'
import TermMap from '../TermMap.js'

const env = new Environment([DataFactory, TermMapFactory])

describe('Factory', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TermMapFactory, 'function')
  })

  describe('.termMap', () => {
    it('should be a method', () => {
      strictEqual(typeof env.termMap, 'function')
    })

    it('should return a TermMap instance', () => {
      const result = env.termMap()

      strictEqual(result instanceof TermMap, true)
    })

    it('should add the given entries to the map', () => {
      const entry0 = [env.namedNode('http://example.or/0'), {}]
      const entry1 = [env.namedNode('http://example.or/1'), {}]

      const result = env.termMap([entry0, entry1])

      strictEqual(result.get(entry0[0]), entry0[1])
      strictEqual(result.get(entry1[0]), entry1[1])
    })
  })
})
