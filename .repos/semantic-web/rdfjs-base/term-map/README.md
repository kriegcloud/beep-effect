# @rdfjs/term-map
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/term-map/test.yaml?branch=master)](https://github.com/rdfjs-base/term-map/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/term-map.svg)](https://www.npmjs.com/package/@rdfjs/term-map)

A Map for RDF/JS Terms keys.

This package implements the JavaScript Map interface exclusively for RDF/JS Terms keys and treats Terms with the same N-Triples representation as they are the same object.

## Usage

The package exports the constructor of the Term-Map.
New instances can be created just like JavaScript Maps:

```js
import rdf from '@rdfjs/data-model'
import TermMap from '@rdfjs/term-map'

const terms = new TermMap([
  [rdf.namedNode('http://example.org/'), { data: 1 }],
  [rdf.literal('test'), { data: 2 }]
])

// The rdf factory will return a new instance of the literal,
// but the TermMap will check for the N-Triple representation.
// That's why the output will be: "true"
console.log(terms.has(rdf.literal('test')))
```
