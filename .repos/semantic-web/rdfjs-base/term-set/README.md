# @rdfjs/term-set
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/term-set/test.yaml?branch=master)](https://github.com/rdfjs-base/term-set/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/term-set.svg)](https://www.npmjs.com/package/@rdfjs/term-set)

A Set for [RDF/JS Terms](http://rdf.js.org/data-model-spec/#term-interface).

This package implements the JavaScript [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) interface exclusively for RDF/JS Terms and treats Terms with the same N-Triples representation as they are the same object.

## Usage

Use the following command to add the package as a dependency to your project:

```bash
npm install @rdfjs/term-set --save
```

The package exports the constructor of the Term-Set.
New instances can be created just like JavaScript Sets:

```js
import rdf from '@rdfjs/data-model'
import TermSet from '@rdfjs/term-set'

const terms = new TermSet([
  rdf.namedNode('http://example.org/'),
  rdf.literal('test')
])

// The rdf factory will return a new instance of the literal,
// but the Term-Set will check for the N-Triple representation.
// That's why the output will be: "true"
console.log(terms.has(rdf.literal('test')))
```
