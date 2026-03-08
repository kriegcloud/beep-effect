import { deepStrictEqual, throws } from 'assert'
import rdf from '@rdfjs/data-model'
import sinkTest from '@rdfjs/sink/test/index.js'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import decode from 'stream-chunks/decode.js'
import JsonLdSerializer from '../index.js'
import * as ns from './support/namespaces.js'

describe('@rdfjs/serializer-jsonld', () => {
  sinkTest(JsonLdSerializer, { readable: true })

  it('should serialize rdf:type', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      '@type': 'http://example.org/type'
    }]
    const quad = rdf.quad(ns.ex.subject, ns.rdf.type, ns.ex.type)
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize blank node rdf:type', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      '@type': '_:b1'
    }]
    const quad = rdf.quad(ns.ex.subject, ns.rdf.type, rdf.blankNode('b1'))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize blank node subjects', async () => {
    const jsonld = [{
      '@id': '_:b1',
      'http://example.org/predicate': 'object'
    }]
    const quad = rdf.quad(rdf.blankNode(), ns.ex.predicate, rdf.literal('object'))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize named node objects', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    }]
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object)
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize blank node objects', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@id': '_:b1'
      }
    }]
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.blankNode('b1'))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize a literal', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }]
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object'))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize a language literal', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@language': 'en',
        '@value': 'object'
      }
    }]
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object', 'en'))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize a datatype literal', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@type': 'http://example.org/datatype',
        '@value': 'object'
      }
    }]
    const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object', ns.ex.datatype))
    const input = Readable.from([quad])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize quads with default graph into object root', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object2'
    }]
    const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'))
    const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object2'))
    const input = Readable.from([quad1, quad2])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize quads with named graph into @graph property', async () => {
    const jsonld = [{
      '@id': 'http://example.org/graph',
      '@graph': {
        '@id': 'http://example.org/subject',
        'http://example.org/predicate': 'object1'
      }
    }, {
      '@id': 'http://example.org/graph',
      '@graph': {
        '@id': 'http://example.org/subject',
        'http://example.org/predicate': 'object2'
      }
    }]
    const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object1'), ns.ex.graph)
    const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object2'), ns.ex.graph)
    const input = Readable.from([quad1, quad2])
    const serializer = new JsonLdSerializer()

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize with object encoding if option is given', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 2'
    }]
    const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object 1'))
    const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object 2'))
    const input = Readable.from([quad1, quad2])
    const serializer = new JsonLdSerializer({ encoding: 'object' })

    const content = await chunks(serializer.import(input))

    deepStrictEqual(content[0], jsonld)
  })

  it('should serialize with string encoding if option is given', async () => {
    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 2'
    }]
    const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object 1'))
    const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, rdf.literal('object 2'))
    const input = Readable.from([quad1, quad2])
    const serializer = new JsonLdSerializer({ encoding: 'string' })

    const content = await decode(serializer.import(input))

    deepStrictEqual(JSON.parse(content), jsonld)
  })

  it('should serialize throw an error if the given encoding is unknown', () => {
    const input = Readable.from([])
    const serializer = new JsonLdSerializer({ encoding: 'not a valid encoding' })

    throws(() => {
      serializer.import(input)
    })
  })
})
