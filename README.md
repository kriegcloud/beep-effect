# @rdfjs/sink-to-duplex

[![Build Status](https://travis-ci.org/rdfjs/sink-to-duplex.svg?branch=master)](https://travis-ci.org/rdfjs/sink-to-duplex)

[![npm version](https://img.shields.io/npm/v/@rdfjs/sink-to-duplex.svg)](https://www.npmjs.com/package/@rdfjs/sink-to-duplex)

Creates a duplex wrapper for RDFJS Sink.
With the duplex wrapper it's possible to use a RDFJS Sink like a Node.js duplex stream with a Readable and Writable interface.

## Usage

The package exports just the factory function to create the wrapper.
A second argument can be given that will be used to create the duplex stream.
That second argument could be needed to enable object mode on the Readable or Writeable interface.

Enable object mode on the Readable interface:

```javascript
sinkToDuplex(new N3Parser(), { readableObjectMode: true })
```

Enable object mode on the Writable interface:

```javascript
sinkToDuplex(new NTriplesSerializer(), { writableObjectMode: true })
```

## Example

In this examples triples from a Turtle file are parsed, serialized with the N-Triples serializer and written to `stdout`. 
Without the duplex wrapper nested `.import()` calls are required:

```javascript
const fs = require('fs')
const N3Parser = require('@rdfjs/parser-n3')
const NTriplesSerializer = require('@rdfjs/serializer-ntriples')

const input = fs.createReadStream('test.ttl')
const parser = new N3Parser()
const serializer = new NTriplesSerializer()

serializer.import(parser.import(input)).pipe(process.stdout)
```

With the duplex wrapper it's possible to use a `.pipe()` chain:

```javascript
const fs = require('fs')
const sinkToDuplex = require('@rdfjs/sink-to-duplex')
const N3Parser = require('@rdfjs/parser-n3')
const NTriplesSerializer = require('@rdfjs/serializer-ntriples')

const input = fs.createReadStream('test.ttl')
const parser = sinkToDuplex(new N3Parser(), { readableObjectMode: true })
const serializer = sinkToDuplex(new NTriplesSerializer(), { writableObjectMode: true })

input.pipe(parser).pipe(serializer).pipe(process.stdout)
```
