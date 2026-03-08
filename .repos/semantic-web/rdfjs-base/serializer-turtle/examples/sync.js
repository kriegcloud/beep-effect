import rdf from '@rdfjs/data-model'
import Serializer from '../index.js'

const serializer = new Serializer()
const input = [
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/givenName'),
    rdf.literal('Gregory')),
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/familyName'),
    rdf.literal('House')),
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/knows'),
    rdf.namedNode('https://housemd.rdf-ext.org/person/james-wilson'))
]

const output = serializer.transform(input)
process.stdout.write(output)
