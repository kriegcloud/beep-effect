import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import createWriteOptions from '../lib/createWriteOptions.js'

describe('createWriteOptions', () => {
  it('should be a function', () => {
    strictEqual(typeof createWriteOptions, 'function')
  })

  it('should return an object', () => {
    const result = createWriteOptions('')

    strictEqual(typeof result, 'object')
  })

  it('should set method to PUT', () => {
    const result = createWriteOptions('')

    strictEqual(result.method, 'PUT')
  })

  it('should create a headers object', () => {
    const result = createWriteOptions('')

    strictEqual(typeof result.headers, 'object')
    strictEqual(typeof result.headers.get, 'function')
    strictEqual(typeof result.headers.set, 'function')
  })

  it('should set the content-type header matching the file extension', () => {
    const result = createWriteOptions('example.ttl')

    strictEqual(result.headers.get('content-type'), 'text/turtle')
  })

  it('should not set the content-type header if the file extension is unknown', () => {
    const result = createWriteOptions('example.txt')

    strictEqual(result.headers.get('content-type'), null)
  })

  it('should forward the body object', () => {
    const body = {}
    const result = createWriteOptions('', body)

    strictEqual(result.body, body)
  })
})
