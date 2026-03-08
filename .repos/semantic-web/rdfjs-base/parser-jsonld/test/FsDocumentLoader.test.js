import { deepStrictEqual, rejects, strictEqual } from 'assert'
import { readFile } from 'fs/promises'
import { describe, it } from 'mocha'
import FsDocumentLoader from '../FsDocumentLoader.js'

describe('FsDocumentLoader', () => {
  it('should be a constructor', async () => {
    strictEqual(typeof FsDocumentLoader, 'function')
  })

  it('should assign a given object to the map', () => {
    const map = {
      'http://example.org/': 'example.org.json',
      'http://example.com/': 'example.com.json'
    }

    const documentLoader = new FsDocumentLoader(map)

    strictEqual(documentLoader.map.size, 2)

    for (const [key, value] of Object.entries(map)) {
      strictEqual(documentLoader.map.get(key), value)
    }
  })

  it('should assign a given map to the map', () => {
    const map = new Map([
      ['http://example.org/', 'example.org.json'],
      ['http://example.com/', 'example.com.json']
    ])

    const documentLoader = new FsDocumentLoader(map)

    strictEqual(documentLoader.map.size, 2)
    deepStrictEqual(documentLoader.map, map)
  })

  describe('.load', () => {
    it('should be a method', () => {
      const documentLoader = new FsDocumentLoader({})

      strictEqual(typeof documentLoader.load, 'function')
    })

    it('should return the context in the map as object', async () => {
      const url = 'http://example.org/'
      const path = 'test/support/example.org.json'

      const map = {}
      map[url] = path

      const documentLoader = new FsDocumentLoader(map)
      const expected = JSON.parse((await readFile(path)).toString())

      const actual = await documentLoader.load(url)

      deepStrictEqual(actual, expected)
    })

    it('should throw an error if the use context is not given in the map', async () => {
      const documentLoader = new FsDocumentLoader({})

      await rejects(async () => {
        await documentLoader.load('http://example.com/')
      })
    })
  })
})
