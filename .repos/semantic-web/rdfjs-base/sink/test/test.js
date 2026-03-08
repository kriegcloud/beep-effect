import { deepEqual } from 'assert'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import Sink from '../index.js'
import waitFor from './support/waitFor.js'
import test from './index.js'

class TestStream extends Readable {
  constructor (input, options) {
    super()

    this.options = options

    input.on('end', () => {
      this.push(null)
    })
  }

  _read () {}
}

class TestSink extends Sink {
  constructor (options) {
    super(TestStream, options)
  }
}

describe('rdf-sink', () => {
  test(TestSink)

  it('should forward the constructor options', () => {
    const options = { a: '1' }
    const input = new Readable()

    input._read = () => {
      input.push(null)
    }

    const sink = new TestSink(options)
    const stream = sink.import(input)

    input.resume()
    stream.resume()

    return waitFor(stream).then(() => {
      deepEqual(stream.options, options)
    })
  })

  it('should merge .import method options and constructor options', () => {
    const constructorOptions = {
      a: '1',
      b: '2'
    }

    const methodOptions = {
      b: '3',
      c: '4'
    }

    const mergedOptions = {
      a: '1',
      b: '3',
      c: '4'
    }

    const input = new Readable()

    input._read = () => {
      input.push(null)
    }

    const sink = new TestSink(constructorOptions)
    const stream = sink.import(input, methodOptions)

    input.resume()
    stream.resume()

    return waitFor(stream).then(() => {
      deepEqual(stream.options, mergedOptions)
    })
  })
})
