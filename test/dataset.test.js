import { deepStrictEqual, rejects, strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import { datasetEqual } from 'rdf-test/assert.js'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import { fromText, fromURL, toText, toURL } from '../dataset.js'
import example from './support/example.js'
import env from './support/factory.js'

describe('dataset', () => {
  describe('fromText', () => {
    it('should be a function', () => {
      strictEqual(typeof fromText, 'function')
    })

    it('should return a dataset with the parsed quads', async () => {
      const factory = env.clone()

      const dataset = await fromText('text/turtle', example.nt, { factory })

      datasetEqual(dataset, example.dataset)
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

    it('should reject if the media type is unknown', async () => {
      const factory = env.clone()

      await rejects(fromText('text/plain', example.nt, { factory }), {
        message: /unknown media type/
      })
    })

    it('should reject on parser errors', async () => {
      const factory = env.clone()

      await rejects(fromText('text/turtle', 'test', { factory }), {
        message: /Unexpected "test"/
      })
    })
  })

  describe('fromURL', () => {
    it('should be a function', () => {
      strictEqual(typeof fromURL, 'function')
    })

    it('should return the dataset from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          dataset: async () => example.dataset,
          ok: true
        }
      }

      const dataset = await fromURL('', { factory })

      datasetEqual(dataset, example.dataset)
    })

    it('should fetch it from the given URL', async () => {
      let actualUrl
      const factory = env.clone()

      factory.fetch = async url => {
        actualUrl = url

        return {
          dataset: async () => example.dataset,
          ok: true
        }
      }

      await fromURL('http://example.org/resource', { factory })

      strictEqual(actualUrl, 'http://example.org/resource')
    })

    it('should fetch it with the GET method', async () => {
      let actualMethod
      const factory = env.clone()

      factory.fetch = async (url, { method }) => {
        actualMethod = method

        return {
          dataset: async () => example.dataset,
          ok: true
        }
      }

      await fromURL('', { factory })

      strictEqual(actualMethod, 'GET')
    })

    it('should use the given media type', async () => {
      const factory = env.clone()
      const headers = new Headers({ 'content-type': 'text/plain' })

      factory.fetch = async () => {
        return {
          dataset: async () => example.dataset,
          headers,
          ok: true
        }
      }

      await fromURL('', { factory, mediaType: 'text/turtle' })

      strictEqual(headers.get('content-type'), 'text/turtle')
    })

    it('should forward additional arguments', async () => {
      let actualArgs
      const factory = env.clone()

      factory.fetch = async (url, { method, ...args }) => {
        actualArgs = args

        return {
          dataset: async () => example.dataset,
          ok: true
        }
      }

      await fromURL('', { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should forward errors from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        throw new Error('test')
      }

      await rejects(fromURL('', { factory }), {
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

      await rejects(fromURL('', { factory }), {
        message: 'can\'t read data from <>[403]: test'
      })
    })

    it('should forward errors from the dataset method', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        return {
          dataset: async () => {
            throw new Error('test')
          },
          ok: true
        }
      }

      await rejects(fromURL('', { factory }), {
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

      const text = await toText('application/n-triples', example.dataset, { factory })

      strictEqual(text, example.nt)
    })

    it('should return a text with the serialized triples with the given prefixes', async () => {
      const factory = env.clone()
      const prefixes = new Map([
        ['ex', factory.namedNode('http://example.org/')]
      ])

      const text = await toText('text/turtle', example.dataset, { factory, prefixes })

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

      await toText('text/turtle', example.dataset, { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should reject if the media type is unknown', async () => {
      const factory = env.clone()

      await rejects(toText('text/plain', example.dataset, { factory }), {
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

      await rejects(toText('text/plain', [{}], { factory }), {
        message: /test/
      })
    })
  })

  describe('toURL', () => {
    it('should be a function', () => {
      strictEqual(typeof toURL, 'function')
    })

    it('should write the dataset via fetch', async () => {
      let actualBody
      const factory = env.clone()

      factory.fetch = async (url, { body }) => {
        actualBody = await chunks(body)

        return {
          ok: true
        }
      }

      await toURL('', example.dataset, { factory })

      datasetEqual(actualBody, example.dataset)
    })

    it('should write the dataset via fetch with the given prefixes', async () => {
      let actualBody
      let actialPrefixes
      const factory = env.clone()
      const prefixes = new Map([
        ['ex', factory.namedNode('http://example.org/')]
      ])

      factory.fetch = async (url, { body, prefixes }) => {
        actualBody = await chunks(body)
        actialPrefixes = prefixes

        return {
          ok: true
        }
      }

      await toURL('', example.dataset, { factory, prefixes })

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

      await toURL('http://example.org/resource', example.dataset, { factory })

      strictEqual(actualUrl, 'http://example.org/resource')
    })

    it('should write it with the PUT method', async () => {
      let actualMethod
      const factory = env.clone()

      factory.fetch = async (url, options = {}) => {
        actualMethod = options.method

        return {
          ok: true
        }
      }

      await toURL('', example.dataset, { factory })

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

      await toURL('', example.dataset, { factory, a: 'b', c: 'd' })

      deepStrictEqual(actualArgs, { a: 'b', c: 'd' })
    })

    it('should forward errors from fetch', async () => {
      const factory = env.clone()

      factory.fetch = async () => {
        throw new Error('test')
      }

      await rejects(toURL('', example.dataset, { factory }), {
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

      await rejects(toURL('', example.dataset, { factory }), {
        message: 'can\'t write data to <>[500]: test'
      })
    })

    it('should forward http status errors after the body was consumed', async () => {
      const factory = env.clone()

      factory.fetch = async (url, { body }) => {
        await chunks(body)

        return {
          ok: false,
          status: 500,
          text: async () => 'test'
        }
      }

      await rejects(toURL('', example.dataset, { factory }), {
        message: 'can\'t write data to <>[500]: test'
      })
    })
  })
})
