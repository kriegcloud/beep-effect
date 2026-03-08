import JsonLdParser from '@rdfjs/parser-jsonld'
import N3Parser from '@rdfjs/parser-n3'
import NTriplesSerializer from '@rdfjs/serializer-ntriples'
import TurtleSerializer from '@rdfjs/serializer-turtle'
import SinkMap from '@rdfjs/sink-map'
import JsonLdSerializer from './lib/JsonLdSerializer.js'
import PrettyJsonLdSerializer from './lib/PrettyJsonLdSerializer.js'
import RdfXmlParser from './lib/RdfXmlParser.js'

const parsers = new SinkMap([
  ['application/ld+json', new JsonLdParser()],
  ['application/trig', new N3Parser()],
  ['application/n-quads', new N3Parser()],
  ['application/n-triples', new N3Parser()],
  ['text/n3', new N3Parser()],
  ['text/turtle', new N3Parser()],
  ['application/rdf+xml', new RdfXmlParser()]
])

const serializers = new SinkMap([
  ['application/ld+json', new JsonLdSerializer()],
  ['application/n-quads', new NTriplesSerializer()],
  ['application/n-triples', new NTriplesSerializer()],
  ['text/n3', new NTriplesSerializer()],
  ['text/turtle', new NTriplesSerializer()]
])

const formats = {
  parsers,
  serializers
}

export {
  formats as default,
  JsonLdParser,
  JsonLdSerializer,
  N3Parser,
  NTriplesSerializer,
  PrettyJsonLdSerializer,
  RdfXmlParser,
  TurtleSerializer
}
