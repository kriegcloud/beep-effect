import { strictEqual } from 'assert'
import { it } from 'mocha'
import { Readable } from 'readable-stream'
import waitFor from './support/waitFor.js'

function expectError (p) {
  return new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
      return p()
    }).then(() => {
      reject(new Error('no error thrown'))
    }).catch(() => {
      resolve()
    })
  })
}

function test (Sink, options) {
  options = options || {}

  it('should be a constructor', () => {
    strictEqual(typeof Sink, 'function')
  })

  it('should have a .import method', () => {
    const sink = new Sink()

    strictEqual(typeof sink.import, 'function')
  })

  if (options.readable) {
    it('.import should return a Stream instance', () => {
      const sink = new Sink()
      const input = new Readable({ read: () => {} })
      const stream = sink.import(input)

      strictEqual(stream.readable, true)
    })
  }

  it('should forward the error event', () => {
    const input = new Readable()

    input._read = () => {
      input.emit('error', new Error(''))
    }

    return expectError(() => {
      const sink = new Sink()
      const stream = sink.import(input)

      input.resume()
      stream.resume()

      return waitFor(stream)
    })
  })
}

export default test
