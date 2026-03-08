import { deepStrictEqual, strictEqual } from 'assert'
import rdf from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import sinkTest from '@rdfjs/sink/test/index.js'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import decode from 'stream-chunks/decode.js'
import JsonldSerializer from '../index.js'

const ns = {
  ex: namespace('http://example.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
}

describe('@rdfjs/serializer-jsonld-ext', () => {
  sinkTest(JsonldSerializer, { readable: true })

  it('should support string output', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = JSON.stringify([{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': [{
        '@value': 'object1'
      }]
    }])

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ encoding: 'string' })
    const stream = serializer.import(input)
    const result = await decode(stream)

    strictEqual(result, expected)
  })

  it('should support pretty-print string output', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = JSON.stringify([{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': [{
        '@value': 'object1'
      }]
    }], null, 2)

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ encoding: 'string', prettyPrint: true })
    const stream = serializer.import(input)
    const result = await decode(stream)

    strictEqual(result, expected)
  })

  it('should support compact', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))
    const context = { ex: 'http://example.org/' }

    const expected = {
      '@context': context,
      '@id': 'ex:subject',
      'ex:predicate': 'object1'
    }

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ compact: true, context })
    const stream = serializer.import(input)
    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should support frame', async () => {
    const root = rdf.blankNode()
    const property = rdf.blankNode()
    const quads = [
      rdf.quad(root, ns.rdf.type, ns.ex.Thing),
      rdf.quad(root, ns.ex.property0, property),
      rdf.quad(property, ns.rdf.type, ns.ex.OtherThing),
      rdf.quad(property, ns.ex.property1, rdf.literal('value1'))
    ]

    const context = {
      '@context': {
        '@vocab': 'http://example.org/'
      },
      '@type': 'Thing'
    }

    const expected = {
      '@context': {
        '@vocab': 'http://example.org/'
      },
      '@type': 'Thing',
      property0: {
        '@type': 'OtherThing',
        property1: 'value1'
      }
    }

    const input = Readable.from(quads)
    const serializer = new JsonldSerializer({ frame: true, context })
    const stream = serializer.import(input)
    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should remove @context if skipContext is true', async () => {
    const subject = rdf.blankNode()
    const quads = [
      rdf.quad(subject, ns.rdf.type, ns.ex.Thing),
      rdf.quad(subject, ns.ex.property0, rdf.literal('value0'))
    ]

    const context = {
      '@context': {
        '@vocab': 'http://example.org/'
      },
      '@type': 'Thing'
    }

    const expected = {
      '@type': 'Thing',
      property0: 'value0'
    }

    const input = Readable.from(quads)
    const serializer = new JsonldSerializer({ frame: true, context, skipContext: true })
    const stream = serializer.import(input)
    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should handle baseIRI given as NamedNode', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = {
      '@context': {
        '@base': 'http://example.org/'
      },
      '@id': 'subject',
      'http://example.org/predicate': 'object1'
    }

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ baseIRI: ns.ex(''), compact: true })
    const stream = serializer.import(input)

    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should handle baseIRI given as URL', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = {
      '@context': {
        '@base': 'http://example.org/'
      },
      '@id': 'subject',
      'http://example.org/predicate': 'object1'
    }

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ baseIRI: new URL(ns.ex('').value), compact: true })
    const stream = serializer.import(input)

    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should handle baseIRI given as string', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = {
      '@context': {
        '@base': 'http://example.org/'
      },
      '@id': 'subject',
      'http://example.org/predicate': 'object1'
    }

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ baseIRI: ns.ex('').value, compact: true })
    const stream = serializer.import(input)

    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })

  it('should support prefixes', async () => {
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))

    const expected = {
      '@context': {
        ex: 'http://example.org/'
      },
      '@id': 'ex:subject',
      'ex:predicate': 'object1'
    }

    const input = Readable.from([quad])
    const serializer = new JsonldSerializer({ compact: true })
    const stream = serializer.import(input)

    input.emit('prefix', 'ex', rdf.namedNode('http://example.org/'))

    const result = (await chunks(stream))[0]

    deepStrictEqual(result, expected)
  })
})
