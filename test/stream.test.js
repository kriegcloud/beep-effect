import { deepStrictEqual, rejects, strictEqual } from 'node:assert'
import { isReadableStream, isWritableStream } from 'is-stream'
import { describe, it } from 'mocha'
import { datasetEqual } from 'rdf-test/assert.js'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import { fromText, fromURL, toText, toURL } from '../stream.js'
import example from './support/example.js'
import env from './support/factory.js'

describe('stream', () => {
  describe('fromText', () => {
    it('should be a function', () => {
      strictEqual(typeof fromText, 'function')
    })

    it('should return readable stream', async () => {
      const factory = env.clone()

      const stream = fromText('text/turtle', '', { factory })

      strictEqual(isReadableStream(stream), true)
      strictEqual(isWritableStream(stream), false)
    })

    it('should return the parsed quads', async () => {
      const factory = env.clone()

      const stream = fromText('text/turtle', example.nt, { factory })
      const quads = await chunks(stream)

      datasetEqual(quads, example.dataset)
    })

    it('should forward additional arguments', async () => {
      let actualArgs
      const factory = env.clone()

      factory.formats.parsers.set('text/turtle', {
        import: (stream, args) => {
          actualArgs = args

          return Readable.from([])
        }
      })

      await fromText('text/turtle', example.nt, { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should emit an error if the media type is unknown', async () => {
      const factory = env.clone()

      const stream = fromText('text/plain', example.nt, { factory })

      await rejects(chunks(stream), {
        message: /unknown media type/
      })
    })

    it('should forward parser errors', async () => {
      const factory = env.clone()

      const stream = fromText('text/turtle', 'test', { factory })

      await rejects(chunks(stream), {
        message: /test/
      })
    })
  })

  describe('fromURL', () => {
    it('should be a function', () => {
      strictEqual(typeof fromURL, 'function')
    })

    it('should return readable stream', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('', { factory })

      strictEqual(isReadableStream(stream), true)
      strictEqual(isWritableStream(stream), false)
    })

    it('should return the quads from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('', { factory })
      const quads = await chunks(stream)

      datasetEqual(quads, example.dataset)
    })

    it('should fetch it from the given URL', async () => {
      let actualUrl
      const factory = env.clone()

      factory.fetch = async url => {
        actualUrl = url

        return {
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('http://example.org/resource', { factory })
      await chunks(stream)

      strictEqual(actualUrl, 'http://example.org/resource')
    })

    it('should fetch it with the GET method', async () => {
      let actualMethod
      const factory = env.clone()

      factory.fetch = async (url, { method }) => {
        actualMethod = method

        return {
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('', { factory })
      await chunks(stream)

      strictEqual(actualMethod, 'GET')
    })

    it('should use the given media type', async () => {
      const factory = env.clone()
      const headers = new Headers({ 'content-type': 'text/plain' })

      factory.fetch = async () => {
        return {
          headers,
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('', { factory, mediaType: 'text/turtle' })
      await chunks(stream)

      strictEqual(headers.get('content-type'), 'text/turtle')
    })

    it('should forward additional arguments', async () => {
      let actualArgs
      const factory = env.clone()

      factory.fetch = async (url, { method, ...args }) => {
        actualArgs = args

        return {
          ok: true,
          quadStream: async () => example.stream()
        }
      }

      const stream = fromURL('', { factory, a: 'b', c: 'd' })
      await chunks(stream)

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should forward errors from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        throw new Error('test')
      }

      const stream = fromURL('', { factory })

      await rejects(chunks(stream), {
        message: 'test'
      })
    })

    it('should forward http status errors', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: false,
          status: 403,
          text: async () => 'test'
        }
      }

      const stream = fromURL('', { factory })

      await rejects(chunks(stream), {
        message: 'can\'t read data from <>[403]: test'
      })
    })

    it('should forward errors from the quadStream method', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: true,
          quadStream: async () => {
            throw new Error('test')
          }
        }
      }

      const stream = fromURL('', { factory })

      await rejects(chunks(stream), {
        message: 'test'
      })
    })

    it('should forward errors from the stream', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: true,
          quadStream: async () => {
            return new Readable({
              read () {
                this.destroy(new Error('test'))
              }
            })
          }
        }
      }

      const stream = fromURL('', { factory })

      await rejects(chunks(stream), {
        message: 'test'
      })
    })
  })

  describe('toText', () => {
    it('should be a function', () => {
      strictEqual(typeof toText, 'function')
    })

    it('should return a text with the serialized triples', async () => {
      const factory = env.clone()

      const text = await toText('application/n-triples', example.stream(), { factory })

      strictEqual(text, example.nt)
    })

    it('should return a text with the serialized triples with the given prefixes', async () => {
      const factory = env.clone()
      const prefixes = new Map([
        ['ex', factory.namedNode('http://example.org/')]
      ])

      const text = await toText('text/turtle', example.stream(), { factory, prefixes })

      strictEqual(text, example.ttl)
    })

    it('should forward additional arguments', async () => {
      let actualArgs
      const factory = env.clone()

      factory.formats.serializers.set('text/turtle', {
        import: (stream, { prefixes, ...args }) => {
          actualArgs = args

          return Readable.from([])
        }
      })

      await toText('text/turtle', example.stream(), { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should reject if the media type is unknown', async () => {
      const factory = env.clone()

      await rejects(toText('text/plain', example.stream(), { factory }), {
        message: /unknown media type/
      })
    })

    it('should reject on serializer errors', async () => {
      const factory = env.clone()

      factory.formats.serializers.set('text/plain', {
        import: () => {
          return new Readable({
            read () {
              this.destroy(new Error('test'))
            }
          })
        }
      })

      await rejects(toText('text/plain', Readable.from([{}]), { factory }), {
        message: /test/
      })
    })
  })

  describe('toURL', () => {
    it('should be a function', () => {
      strictEqual(typeof toURL, 'function')
    })

    it('should write the quad stream via fetch', async () => {
      let actualBody
      const factory = env.clone()

      factory.fetch = async (url, { body }) => {
        actualBody = await chunks(body)

        return {
          ok: true
        }
      }

      await toURL('', example.stream(), { factory })

      datasetEqual(actualBody, example.dataset)
    })

    it('should write the quad stream via fetch with the given prefixes', async () => {
      let actualBody
      let actialPrefixes
      const factory = env.clone()
      const prefixes = new Map([
        ['ex', factory.namedNode('http://example.org/')]
      ])

      factory.fetch = async (url, { body }) => {
        actualBody = await chunks(body)
        actialPrefixes = prefixes

        return {
          ok: true
        }
      }

      await toURL('', example.stream(), { factory, prefixes })

      datasetEqual(actualBody, example.dataset)
      strictEqual(actialPrefixes, prefixes)
    })

    it('should write it to the given URL', async () => {
      let actualUrl
      const factory = env.clone()

      factory.fetch = async url => {
        actualUrl = url

        return {
          ok: true
        }
      }

      await toURL('http://example.org/resource', example.stream(), { factory })

      strictEqual(actualUrl, 'http://example.org/resource')
    })

    it('should write it with the PUT method', async () => {
      let actualMethod
      const factory = env.clone()

      factory.fetch = async (url, { method }) => {
        actualMethod = method

        return {
          ok: true
        }
      }

      await toURL('', example.stream(), { factory })

      strictEqual(actualMethod, 'PUT')
    })

    it('should forward additional arguments', async () => {
      let actualArgs
      const factory = env.clone()

      factory.fetch = async (url, { method, headers, body, prefixes, ...args }) => {
        actualArgs = args

        return {
          ok: true
        }
      }

      await toURL('', example.stream(), { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should forward errors from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        throw new Error('test')
      }

      await rejects(toURL('', example.stream(), { factory }), {
        message: 'test'
      })
    })

    it('should forward http status errors', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          ok: false,
          status: 500,
          text: async () => 'test'
        }
      }

      await rejects(toURL('', example.stream(), { factory }), {
        message: 'can\'t write data to <>[500]: test'
      })
    })
  })
})
