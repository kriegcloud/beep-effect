# @rdfjs/serializer-turtle

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/serializer-turtle/test.yaml?branch=master)](https://github.com/rdfjs-base/serializer-turtle/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/serializer-turtle.svg)](https://www.npmjs.com/package/@rdfjs/serializer-turtle)

A [Turtle](https://www.w3.org/TR/turtle/) serializer that implements the [RDF/JS Sink interface](http://rdf.js.org/stream-spec/#sink-interface).
It serializes the given quads to a pretty-printed Turtle string.

**All quads need to be kept in memory for pretty-printing.
The quads of the stream are collected and serialized after the last quad is written.**

## Install

```bash
npm install --save @rdfjs/serializer-turtle
```

## Usage

The package exports the serializer as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDF/JS specification](http://rdf.js.org/stream-spec/#sink-interface), must be called to do the actual serialization.
It expects a [Stream](http://rdf.js.org/stream-spec/#stream-interface) of [Quads](http://rdf.js.org/data-model-spec/#quad-interface) as an argument.
The method will return a [Stream](http://rdf.js.org/stream-spec/#stream-interface) that emits the Turtle as a string.

### Example

This example shows how to create a serializer instance and feed it with a stream of quads.
The Turtle emitted by the serializer will be written to stdout.

```javascript
import { Readable } from 'stream'
import rdf from '@rdfjs/data-model'
import Serializer from '@rdfjs/serializer-turtle'

const serializer = new Serializer()
const input = Readable.from([
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
])

const output = serializer.import(input)
output.pipe(process.stdout)
```

### transform(quads)

The serializer code runs sync, and the [RDF/JS Sink interface](http://rdf.js.org/stream-spec/#sink-interface) is just a wrapper.
If your use case is very specific, with a low chance of using other formats, it can be used directly.
The `.transform` method accepts [Quads](http://rdf.js.org/data-model-spec/#quad-interface) provided as an object that implements the `Symbol.iterator` method.
It returns the generated Turtle code as a string.

#### Example

This example shows how to create a serializer instance and feed it with quads.
The returned Turtle will be written to the console.

```javascript
import rdf from '@rdfjs/data-model'
import Serializer from '@rdfjs/serializer-turtle'

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
```
