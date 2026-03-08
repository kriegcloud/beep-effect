import { doesNotReject, strictEqual, throws } from 'assert'
import rdf from '@rdfjs/data-model'
import { describe, it } from 'mocha'
import { datasetEqual } from 'rdf-test/assert.js'
import PlainSerializer from '../lib/PlainSerializer.js'
import ECMAScriptModuleWriter from '../lib/writer/ECMAScriptModuleWriter.js'
import * as example from './support/example.js'
import run, { load } from './support/run.js'

describe('PlainSerializer', () => {
  it('should be a constructor', () => {
    strictEqual(typeof PlainSerializer, 'function')
  })

  describe('transform', () => {
    it('should be a method', () => {
      const serializer = new PlainSerializer()

      strictEqual(typeof serializer.transform, 'function')
    })

    it('should generate valid JavaScript code', async () => {
      const serializer = new PlainSerializer()

      const code = serializer.transform([])

      await doesNotReject(async () => {
        await load(code)
      })
    })

    it('should generate code that uses the given factory', async () => {
      const { quads } = await example.simple()
      const called = {}
      const factory = {
        blankNode: () => {
          called.blankNode = true
        },
        literal: () => {
          called.literal = true
        },
        namedNode: () => {
          called.namedNode = true
        },
        quad: () => {
          called.quad = true
        }
      }
      const serializer = new PlainSerializer()

      const code = serializer.transform(quads)

      await run(code, { factory })

      strictEqual(called.blankNode, true)
      strictEqual(called.literal, true)
      strictEqual(called.namedNode, true)
      strictEqual(called.quad, true)
    })

    it('should throw an error if an unknown termType is given', async () => {
      const quads = [rdf.quad(
        rdf.namedNode('http://example.com/'),
        rdf.namedNode('http://example.org/vocab#'),
        'test'
      )]
      const serializer = new PlainSerializer()

      throws(() => {
        serializer.transform(quads)
      })
    })

    it('should generate code that returns quads which are canonical equal to the given quads', async () => {
      const { quads } = await example.simple()
      const serializer = new PlainSerializer()
      const code = serializer.transform(quads)
      const result = await run(code)

      datasetEqual(result, quads)
    })

    it('should generate prefixes for all named nodes', async () => {
      const { quads } = await example.simple()
      const serializer = new PlainSerializer()
      const code = serializer.transform(quads)

      const result = code.match(/const ns[0-9] = '.*'/g)

      strictEqual(result.length, 2)
    })

    it('should correctly serialize which end in slashes and hashes', () => {
      const quads = [rdf.quad(
        rdf.namedNode('http://example.com/bar'),
        rdf.namedNode('http://example.org/vocab#'),
        rdf.namedNode('http://example.org/foo/')
      )]
      const serializer = new PlainSerializer()
      const code = serializer.transform(quads)

      strictEqual(/const ns[0-9] = 'http:\/\/example.com\/'/.test(code), true)
      strictEqual(/const ns[0-9] = 'http:\/\/example.org\/vocab#'/.test(code), true)
      strictEqual(/const ns[0-9] = 'http:\/\/example.org\/foo\/'/.test(code), true)
    })

    it('should escape quotes in literals', () => {
      const quads = [rdf.quad(
        rdf.namedNode('http://example.com/'),
        rdf.namedNode('http://example.org/vocab#'),
        rdf.literal('\'')
      )]
      const serializer = new PlainSerializer()
      const code = serializer.transform(quads)

      strictEqual(code.includes('f.literal(\'\\\'\')'), true)
    })

    it('should gracefully handle unprefixable named nodes', () => {
      const quads = [rdf.quad(
        rdf.blankNode(),
        rdf.namedNode('http://example.org/mail'),
        rdf.namedNode('mailto:edd@usefulinc.com')
      )]
      const serializer = new PlainSerializer()
      const code = serializer.transform(quads)

      strictEqual(code.includes('f.namedNode(\'mailto:edd@usefulinc.com\')'), true)
    })

    it('should write ESM by default', () => {
      const serializer = new PlainSerializer()

      strictEqual(serializer.writer instanceof ECMAScriptModuleWriter, true)
    })
  })
})
