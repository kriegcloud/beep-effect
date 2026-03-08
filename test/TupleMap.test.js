import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import TupleMap from '../lib/TupleMap.js'
import * as ns from './support/namespaces.js'

const terms = [
  ns.ex.term0,
  ns.ex.term1,
  ns.ex.term2
]
const tuples = [
  [terms[0], terms[1]],
  [null, terms[1]],
  [terms[0], terms[1], terms[2]]
]
const values = [0, 1, 2]
const entries = [
  [tuples[0], values[0]],
  [tuples[1], values[1]],
  [tuples[2], values[2]]
]

describe('TupleMap', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TupleMap, 'function')
  })

  it('should fill the map with the given keys and values', () => {
    const map = new TupleMap(entries)

    deepStrictEqual([...map.keys()], tuples)
    deepStrictEqual([...map.values()], values)
  })

  describe('.delete', () => {
    it('should be a method', () => {
      const map = new TupleMap()

      strictEqual(typeof map.delete, 'function')
    })

    it('should do nothing if the map doesn\'t contain the given couple', () => {
      const map = new TupleMap(entries.slice(1))
      const before = map.size

      map.delete(entries[0])

      strictEqual(map.size, before)
    })

    it('should delete the given couple', () => {
      const expected = tuples.slice()
      expected.splice(1, 1)
      const map = new TupleMap(entries)

      map.delete(tuples[1])

      deepStrictEqual([...map.keys()], expected)
    })
  })

  describe('.get', () => {
    it('should be a method', () => {
      const map = new TupleMap()

      strictEqual(typeof map.get, 'function')
    })

    it('should return the value for the given key', () => {
      const map = new TupleMap(entries)

      strictEqual(map.get(tuples[1]), values[1])
    })

    it('should return undefined if there is no pair for the given key', () => {
      const map = new TupleMap(entries.slice(1))

      strictEqual(map.get(tuples[0]), undefined)
    })
  })

  describe('.has', () => {
    it('should be a method', () => {
      const map = new TupleMap()

      strictEqual(typeof map.has, 'function')
    })

    it('should return true if there is a pair for the given key', () => {
      const map = new TupleMap(entries)

      strictEqual(map.has(tuples[1]), true)
    })

    it('should return false if there is no pair for the given key', () => {
      const map = new TupleMap(entries.slice(1))

      strictEqual(map.has(tuples[0]), false)
    })
  })

  describe('.set', () => {
    it('should be a method', () => {
      const map = new TupleMap()

      strictEqual(typeof map.set, 'function')
    })

    it('should add the given pair to the map', () => {
      const map = new TupleMap(entries.slice(1))

      map.set(tuples[0], values[0])

      strictEqual(map.get(tuples[0]), values[0])
    })

    it('should return the map', () => {
      const map = new TupleMap(entries)

      strictEqual(map.set(tuples[0], values[0]), map)
    })
  })

  describe('static .key', () => {
    it('should be a method', () => {
      strictEqual(typeof TupleMap.key, 'function')
    })

    it('should generate a space separated NT key string', () => {
      const expected = terms.map(term => `<${term.value}>`).join(' ')

      strictEqual(TupleMap.key(terms), expected)
    })

    it('should add use the string undefined for nullable values', () => {
      const tuple = [null, terms[0]]
      const expected = tuple.map(term => (term && `<${term.value}>`) || 'undefined').join(' ')

      strictEqual(TupleMap.key(tuple), expected)
    })
  })
})
