# @rdfjs/serializer-jsonld
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/serializer-jsonld/test.yaml?branch=master)](https://github.com/rdfjs-base/serializer-jsonld/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/serializer-jsonld.svg)](https://www.npmjs.com/package/@rdfjs/serializer-jsonld)

JSON-LD serializer that implements the [RDF/JS Sink interface](http://rdf.js.org/).

## Usage

The package exports the serializer as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDF/JS specification](http://rdf.js.org/#sink-interface), must be called to do the actual serialization.
It expects a quad stream as argument.
The method will return a stream which emits the JSON-LD as a plain object or string.

The constructor accepts an `options` object with the following optional keys:

- `encoding`: Defines the encoding of the output.
  Supported encodings are `string` and `object`.
  By default `object` is used.

It's also possible to pass options as second argument to the `.import` method.
The options from the constructor and the `.import` method will be merged together.

### Example

This example shows how to create a serializer instance and how to feed it with a stream of quads.
The object emitted by the serializer will be written to the console.

```javascript
import rdf from '@rdfjs/data-model'
import { Readable } from 'readable-stream'
import SerializerJsonld from '@rdfjs/serializer-jsonld'

const serializerJsonld = new SerializerJsonld()
const input = new Readable({
  objectMode: true,
  read: () => {
    input.push(rdf.quad(
      rdf.namedNode('http://example.org/sheldon-cooper'),
      rdf.namedNode('http://schema.org/givenName'),
      rdf.literal('Sheldon')))
    input.push(rdf.quad(
      rdf.namedNode('http://example.org/sheldon-cooper'),
      rdf.namedNode('http://schema.org/familyName'),
      rdf.literal('Cooper')))
    input.push(rdf.quad(
      rdf.namedNode('http://example.org/sheldon-cooper'),
      rdf.namedNode('http://schema.org/knows'),
      rdf.namedNode('http://example.org/amy-farrah-fowler')))
    input.push(null)
  }
})
const output = serializerJsonld.import(input)

output.on('data', jsonld => {
  console.log(jsonld)
})
```
