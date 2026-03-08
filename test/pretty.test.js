import { strictEqual } from 'assert'
import JsonLdParser from '@rdfjs/parser-jsonld'
import N3Parser from '@rdfjs/parser-n3'
import NTriplesSerializer from '@rdfjs/serializer-ntriples'
import TurtleSerializer from '@rdfjs/serializer-turtle'
import SinkMap from '@rdfjs/sink-map'
import { describe, it } from 'mocha'
import PrettyJsonLdSerializer from '../lib/PrettyJsonLdSerializer.js'
import RdfXmlParser from '../lib/RdfXmlParser.js'
import formats from '../pretty.js'
import testMediaType from './support/testMediaType.js'

describe('pretty', () => {
  describe('parsers', () => {
    it('should be a SinkMap', () => {
      strictEqual(formats.parsers instanceof SinkMap, true)
    })

    testMediaType(formats.parsers, 'application/ld+json', '@rdfjs/parser-jsonld', JsonLdParser)
    testMediaType(formats.parsers, 'application/trig', '@rdfjs/parser-n3', N3Parser)
    testMediaType(formats.parsers, 'application/n-quads', '@rdfjs/parser-n3', N3Parser)
    testMediaType(formats.parsers, 'application/n-triples', '@rdfjs/parser-n3', N3Parser)
    testMediaType(formats.parsers, 'text/n3', '@rdfjs/parser-n3', N3Parser)
    testMediaType(formats.parsers, 'text/turtle', '@rdfjs/parser-n3', N3Parser)
    testMediaType(formats.parsers, 'application/rdf+xml', 'rdfxml-streaming-parser', RdfXmlParser)
  })

  describe('serializers', () => {
    it('should be a SinkMap', () => {
      strictEqual(formats.serializers instanceof SinkMap, true)
    })

    testMediaType(formats.serializers, 'application/ld+json', '@rdfjs/serializer-jsonld', PrettyJsonLdSerializer)
    testMediaType(formats.serializers, 'application/n-quads', '@rdfjs/serializer-ntriples', NTriplesSerializer)
    testMediaType(formats.serializers, 'application/n-triples', '@rdfjs/serializer-ntriples', NTriplesSerializer)
    testMediaType(formats.serializers, 'text/n3', '@rdfjs/serializer-ntriples', TurtleSerializer)
    testMediaType(formats.serializers, 'text/turtle', '@rdfjs/serializer-ntriples', TurtleSerializer)
  })
})
