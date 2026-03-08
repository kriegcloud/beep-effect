import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import Factory from '../Factory.js'

describe('Factory', () => {
  describe('dataset', () => {
    it('should implement the dataset interface', () => {
      const factory = new Factory()
      factory.init()

      strictEqual(typeof factory.io.dataset.fromText, 'function')
      strictEqual(typeof factory.io.dataset.fromURL, 'function')
      strictEqual(typeof factory.io.dataset.toText, 'function')
      strictEqual(typeof factory.io.dataset.toURL, 'function')
    })
  })

  describe('stream', () => {
    it('should implement the stream interface', () => {
      const factory = new Factory()
      factory.init()

      strictEqual(typeof factory.io.stream.fromText, 'function')
      strictEqual(typeof factory.io.stream.fromURL, 'function')
      strictEqual(typeof factory.io.stream.toText, 'function')
      strictEqual(typeof factory.io.stream.toURL, 'function')
    })
  })
})
