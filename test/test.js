import { strictEqual } from 'assert'
import rdf from '@rdfjs/data-model'
import sinkTest from '@rdfjs/sink/test/index.js'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import decode from 'stream-chunks/decode.js'
import NTriplesSerializer from '../index.js'

describe('@rdfjs/serializer-ntriples', () => {
  sinkTest(NTriplesSerializer, { readable: true })

  it('should serialize incoming quads', async () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object'),
      rdf.namedNode('http://example.org/graph')
    )

    const ntriples = '<http://example.org/subject> <http://example.org/predicate> "object" <http://example.org/graph> .\n'
    const input = Readable.from([quad])

    const serializer = new NTriplesSerializer()
    const stream = serializer.import(input)

    const result = await decode(stream)

    strictEqual(result, ntriples)
  })
})
