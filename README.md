# @rdfjs/serializer-ntriples
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/serializer-ntriples/test.yaml?branch=master)](https://github.com/rdfjs-base/serializer-ntriples/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/serializer-ntriples.svg)](https://www.npmjs.com/package/@rdfjs/serializer-ntriples)

N-Triples serializer that implements the [RDF/JS Sink interface](http://rdf.js.org/).

## Usage

The package exports the serializer as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDF/JS specification](http://rdf.js.org/#sink-interface), must be called to do the actual serialization.
It expects a quad stream as argument.
The method will return a stream which emits N-Triples as strings.
The constructor doesn't need any options.

### Example

This example shows how to create a serializer instance and how to feed it with a stream of quads.
The N-Triples string emitted by the serializer will be written to the console.

```javascript
import rdf from '@rdfjs/data-model'
import { Readable } from 'readable-stream'
import SerializerNtriples from '@rdfjs/serializer-ntriples'

const serializerNtriples = new SerializerNtriples()
const input = Readable.from([
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/givenName'),
    rdf.literal('Sheldon')
  ),
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/familyName'),
    rdf.literal('Cooper')
  ),
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/knows'),
    rdf.namedNode('http://example.org/amy-farrah-fowler')
  )  
])
const output = serializerNtriples.import(input)

output.on('data', ntriples => {
  console.log(ntriples.toString())
})
```
