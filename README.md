# @rdfjs/prefix-map

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/prefix-map/test.yaml?branch=master)](https://github.com/rdfjs-base/prefix-map/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/prefix-map.svg)](https://www.npmjs.com/package/@rdfjs/prefix-map)

A Map for RDF/JS prefixes.

This package implements the JavaScript Map interface for RDF prefixes.
Key-Value pairs are stored with the prefix as the key as a string and the namespaces as the value in an RDF/JS NamedNode object. 
There are some additional convenience methods to handle CURIEs and prefix events of RDF/JS Quad streams.

## Usage

The package exports the constructor of the PrefixMap.
New instances with initial pairs can be created just like JavaScript `Map`s but require an additional `factory` argument:

```javascript
import rdf from '@rdfjs/data-model'
import PrefixMap from '@rdfjs/prefix-map'

// create a PrefixMap, fill it with some initial values, and hand over the data model factory
const prefixes = new PrefixMap([
  ['rdf', rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#')],
  ['schema', rdf.namedNode('http://schema.org')]
], { factory: rdf })

// create two NamedNodes, one with a CURIE and one with a full IRI
const personShort = rdf.namedNode('schema:Person')
const typeLong = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type') 

// convert the CURIE to a full IRI and vice versa
const personLong = prefixes.resolve(personShort)
const typeShort = prefixes.shrink(typeLong)

// write the result to the console
console.log(personLong.value) // -> http://schema.org/Person
console.log(typeShort.value) // -> rdf:type
```
