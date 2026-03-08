# @rdfjs/serializer-rdfjs

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/serializer-rdfjs/test.yaml?branch=master)](https://github.com/rdfjs-base/serializer-rdfjs/actions/workflows/test.yaml)

[![npm version](https://img.shields.io/npm/v/@rdfjs/serializer-rdfjs.svg)](https://www.npmjs.com/package/@rdfjs/serializer-rdfjs)

RDF/JS JavaScript code serializer that implements the [RDF/JS Sink interface](http://rdf.js.org/).
It serializes the given quads to a JavaScript module that exports a single function, like shown below.
The created function will return an array of the re-created quads. 

```javascript
export default ({ factory }) => {
  return [
    factory.quad(
      factory.blankNode('foo'),
      factory.namedNode('http://example.com/bar'),
      factory.literal('baz')
    )
  ]
}
```

## Usage

The package exports the serializer as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDF/JS specification](http://rdf.js.org/#sink-interface), must be called to do the actual serialization.
It expects a quad stream as argument.
The method will return a stream that emits the JavaScript code as a string.

### Example

This example shows how to create a serializer instance and how to feed it with a stream of quads.
The code emitted by the serializer will be written to stdout.

```javascript
import { Readable } from 'stream'
import rdf from '@rdfjs/data-model'
import Serializer from '@rdfjs/serializer-rdfjs'


const serializer = new Serializer()
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

const output = serializer.import(input)
output.pipe(process.stdout)
```

### Target module type

By default, the serializer will produce an ECMAScript module.
The optional argument `module` can be used to serialize it to CommonJS or TypeScript.

#### Example

```js
import Serializer from '@rdfjs/serializer-rdfjs'
import quadStream from './quads'

// serialize to CommonJS by default
const serializer = new Serializer({
  module: 'commonjs'
})

// call to .import also accepts same options parameter
const typescriptStream = serializer.import(quadStream, {
  module: 'ts'
})
```

### transform(quads)

The actual serializer code runs sync, and the RDF/JS Sink interface is just a wrapper. 
If your use case is very specific, with a low chance to use other formats, it can be used directly.
The `.transform` method accepts quads provided as an object that implements the `Symbol.iterator` method.
It returns the generated JavaScript code as a string.

#### Example

This example shows how to create a serializer instance and how to feed it with quads.
The returned code will be written to the console.

```javascript
import rdf from '@rdfjs/data-model'
import Serializer from '@rdfjs/serializer-rdfjs'

const serializer = new Serializer()
const code = serializer.transform([
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/givenName'),
    rdf.literal('Sheldon')),
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/familyName'),
    rdf.literal('Cooper')),
  rdf.quad(
    rdf.namedNode('http://example.org/sheldon-cooper'),
    rdf.namedNode('http://schema.org/knows'),
    rdf.namedNode('http://example.org/amy-farrah-fowler'))
])

console.log(code)
```  
