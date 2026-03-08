# clownface

[![Build Status](https://travis-ci.org/rdf-ext/clownface.svg?branch=master)](https://travis-ci.org/rdf-ext/clownface)
[![NPM Version](https://img.shields.io/npm/v/clownface.svg?style=flat)](https://npm.im/clownface)

Clownface is a graph traversal library inspired by [Gremlin](http://tinkerpop.apache.org/)
which allows to query any [RDF dataset](https://rdf.js.org/dataset-spec/) in a concise and readable way.

##  Introduction

Querying an RDF graph can be challenging. Apart from trivial queries, e.g. simply listing all the
objects connected to a subject, it is usually necessary to write multiple loop and validation
conditions to retrieve an answer. Clownface is there to help.

## Getting started

The package is installed from npm:

```
npm i -S clownface
```

To start using it, an instance of [RDF/JS `DatasetCore`](https://rdf.js.org/dataset-spec/#datasetcore-interface) must be
provided to the exported factory method

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

const firstName = rdf.namedNode('http://xmlns.com/foaf/0.1/firstName')
const lastName = rdf.namedNode('http://xmlns.com/foaf/0.1/lastName')

// initialize
const ptr = rdf.clownface()

// add some resources 
ptr
  .namedNode('http://example.com/person/stuart-bloom')
  .addOut(firstName, 'Stuart')
  .addOut(lastName, 'Bloom')
  .namedNode('http://example.com/person/penny')
  .addOut(firstName, 'Penny')
  
// and now retrieve the first names of those who have a last name
ptr
  .has(lastName)
  .out(firstName)
  .values
```

</run-kit>

## Details

At the core of clownface sits an object called a "graph pointer". A graph pointer can be backed by zero or more RDF/JS terms. It is being created by calling the function exported by the packages's default module.

The current context node or nodes can be accessed by `term`/`value` and `terms`/`values` pairs of properties. The first pair return only a single RDF/JS and its string value. They will return `undefined` if the context points at 0 or >1 nodes. The second pair of properties always return an array of the context terms and their string values.

Graph pointers provides a set of chainable methods. The most important ones are `.in(predicate)` and `.out(predicate)` which allow the traversal through the graph. It is possible to chain as many of these methods to extract a sub-graph from the available dataset.

## More examples

Check out the [deep dive](deep-dive.md) and other pages for a running examples which show how to use the graph pointer to traverse and manipulate RDF graphs.

We use the well known `<subject>` `<predicate>` `<object>` nomenclature for a triple in the following description. All examples are based on the toy dataset [tbbt-ld][tbbt].

[tbbt]: https://github.com/zazuko/tbbt-ld

# API

A Typescript declaration package [`@types/clownface`](https://npm.im/@types/clownface) is available.
