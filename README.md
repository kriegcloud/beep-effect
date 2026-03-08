# @rdfjs/parser-n3
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/parser-n3/test.yaml?branch=master)](https://github.com/rdfjs-base/parser-n3/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/parser-n3.svg)](https://www.npmjs.com/package/@rdfjs/parser-n3)

N3 parser which implements the [RDF/JS Sink interface](http://rdf.js.org/) using the [N3.js](https://github.com/rdfjs/N3.js) library.

## Usage

The package exports the parser as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDFJS specification](http://rdf.js.org/#sink-interface), must be called to do the actual parsing.
It expects a Turtle, Trig, N-Triples or N-Quads string stream.
The method will return a stream which emits the parsed quads.
It also emits `prefix` events as defined in the [RDF/JS specification](http://rdf.js.org/#dom-stream-prefix).

The constructor accepts an `options` object with the following optional keys:

- `baseIRI`: Allows passing the base IRI manually to the `N3.js` library.
- `factory`: Use an alternative RDF/JS data factory.
  By default the [reference implementation](https://github.com/rdfjs-base/data-model/) is used.

It's also possible to pass options as second argument to the `.import` method.
The options from the constructor and the `.import` method will be merged together.

### Example

This example shows how to create a parser instance and how to feed it with a stream from a string.
The parsed quads and the prefixes are written to the console.

```javascript
import ParserN3 from '@rdfjs/parser-n3'
import { Readable } from 'readable-stream'

const parserN3 = new ParserN3()

const input = Readable.from(`
PREFIX s: <http://schema.org/>

[] a s:Person ;
  s:jobTitle "Professor" ;
  s:name "Jane Doe" ;
  s:telephone "(425) 123-4567" ;
  s:url <http://www.janedoe.com> .
`)

const output = parserN3.import(input)

output.on('data', quad => {
  console.log(`quad: ${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
})

output.on('prefix', (prefix, ns) => {
  console.log(`prefix: ${prefix} ${ns.value}`)
})
```
