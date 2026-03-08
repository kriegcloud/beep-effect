import { strictEqual } from 'assert'
import JsonLdParser from '@rdfjs/parser-jsonld'
import N3Parser from '@rdfjs/parser-n3'
import NTriplesSerializer from '@rdfjs/serializer-ntriples'
import TurtleSerializer from '@rdfjs/serializer-turtle'
import SinkMap from '@rdfjs/sink-map'
import { describe, it } from 'mocha'
import formats from '../index.js'
import * as all from '../index.js'
import JsonLdSerializer from '../lib/JsonLdSerializer.js'
import PrettyJsonLdSerializer from '../lib/PrettyJsonLdSerializer.js'
import RdfXmlParser from '../lib/RdfXmlParser.js'
import testMediaType from './support/testMediaType.js'

describe('@rdfjs/formats', () => {
  describe('exports', () => {
    it('should export the JsonLdParser', () => {
      strictEqual(all.JsonLdParser, JsonLdParser)
    })

    it('should export the JsonLdSerializer', () => {
      strictEqual(all.JsonLdSerializer, JsonLdSerializer)
    })

    it('should export the N3Parser', () => {
      strictEqual(all.N3Parser, N3Parser)
    })

    it('should export the NTriplesSerializer', () => {
      strictEqual(all.NTriplesSerializer, NTriplesSerializer)
    })

    it('should export the PrettyJsonLdSerializer', () => {
      strictEqual(all.PrettyJsonLdSerializer, PrettyJsonLdSerializer)
    })

    it('should export the RdfXmlParser', () => {
      strictEqual(all.RdfXmlParser, RdfXmlParser)
    })

    it('should export the TurtleSerializer', () => {
      strictEqual(all.TurtleSerializer, TurtleSerializer)
    })
  })

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

    testMediaType(formats.serializers, 'application/ld+json', '@rdfjs/serializer-jsonld', JsonLdSerializer)
    testMediaType(formats.serializers, 'application/n-quads', '@rdfjs/serializer-ntriples', NTriplesSerializer)
    testMediaType(formats.serializers, 'application/n-triples', '@rdfjs/serializer-ntriples', NTriplesSerializer)
    testMediaType(formats.serializers, 'text/n3', '@rdfjs/serializer-ntriples', NTriplesSerializer)
    testMediaType(formats.serializers, 'text/turtle', '@rdfjs/serializer-ntriples', NTriplesSerializer)
  })
})
