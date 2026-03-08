import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import * as dataset from '../dataset.js'
import * as io from '../index.js'
import * as stream from '../stream.js'

describe('io', () => {
  describe('dataset', () => {
    it('should contain the dataset fromText function', () => {
      strictEqual(io.dataset.fromText, dataset.fromText)
    })

    it('should contain the dataset fromURL function', () => {
      strictEqual(io.dataset.fromURL, dataset.fromURL)
    })

    it('should contain the dataset toText function', () => {
      strictEqual(io.dataset.toText, dataset.toText)
    })

    it('should contain the dataset toURL function', () => {
      strictEqual(io.dataset.toURL, dataset.toURL)
    })
  })

  describe('stream', () => {
    it('should contain the stream fromText function', () => {
      strictEqual(io.stream.fromText, stream.fromText)
    })

    it('should contain the stream fromURL function', () => {
      strictEqual(io.stream.fromURL, stream.fromURL)
    })

    it('should contain the stream toText function', () => {
      strictEqual(io.stream.toText, stream.toText)
    })

    it('should contain the stream toURL function', () => {
      strictEqual(io.stream.toURL, stream.toURL)
    })
  })
})
