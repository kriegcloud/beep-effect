# Clownface context

A `Clownface` object represents 0 or more nodes in an underlying dataset. There are two pairs of properties (getters) which return those nodes:

1. `term`/`terms` which return RDF/JS terms
3. `value`/`values` which return string representation of said terms

It is important to understand their semantics.

The singular `term` and `value` return an object only when the `Clownface` instance represents a single term. If the context is 0 nodes or >1 nodes, they return `undefined`

The plural `terms` and `values` always return an array of objects, or an empty array.

## Initialising the context

As presented in the [getting started](/) and [deep dive](deep-dive.md) examples, a clownface instance is initially created using a factory function exported by the module. Depending on the parameters passed to it, various contexts can be created.

### Empty initial context

An empty context is created by providing only a `dataset` parameter.

This state is quite unique, because this is the only circumstance in which a context will be empty. The moment any node gets pointed, the context will never return to this state.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

// only dataset is a required parameter
const graphPointer = rdf.clownface()

// term/value are undefined
// terms/values are empty arrays
const context = {
  term: graphPointer.term,
  value: graphPointer.value,
  terms: graphPointer.terms,
  values: graphPointer.values
}
```

</run-kit>

### A single pointer

The context can represent a single graph pointer, that is a single node in the graph.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

// the initial term can be initialized in the factory method
const graphPointer = rdf.clownface({ term: rdf.ns.schema.Person })

// term/value are defined
// terms/values are single-element arrays
const context = {
  term: graphPointer.term,
  value: graphPointer.value,
  terms: graphPointer.terms,
  values: graphPointer.values
}
```

</run-kit>

### Multiple pointers

A multi-pointer state is also possible. The pointer can point to multiple nodes simultaneously. In that case `term` and `value` are going to be undefined and only their array variants will return those nodes.

The return value of all [graph traversals](traversal.md) potentially returns a multi-pointer, thus always remember to check if `term/value` is defined.	

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

// the term can also be an array of RDF/JS nodes
const graphPointer = rdf.clownface({ term: [ rdf.ns.schema.Person, rdf.ns.foaf.Person ] })

// term/value are undefined
// terms/values are arrays
const context = {
  term: graphPointer.term,
  value: graphPointer.value,
  terms: graphPointer.terms,
  values: graphPointer.values
}
```

</run-kit>

## Switching context

At any time the graph pointer can be moved to another node using one of a few methods of self-descriptive names:

- `node`
- `namedNode`
- `blankNode`
- `literal`

Note that switching the pointer always returns a new `Clownface` object. Also, the new pointed node does not have to exist in the dataset. Simply changing the pointer also does not modify the dataset.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

const ex = rdf.namespace('http://example.com/')

// the term can also be an array of RDF/JS nodes
const graphPointer = rdf.clownface({ term: ex.foo })

const contexts = {
  // namedNode treat string as URI
  named: graphPointer.namedNode('http://example.com/bar').term,

  // literal can have language or datatype
  literal: graphPointer.literal('10', rdf.ns.xsd.nonNegativeInteger).term,

  // blank node does not require parameters
  blank: graphPointer.blankNode().term,

  // `node` will attempt to detect the term type
  // but be careful with URI strings
  detected: graphPointer.node('http://example.com/bar').term,
    
  // the original object still points at the original node
  original: graphPointer.term,
}
```

</run-kit>

Each one of those methods also accept RDF/JS terms and instances of `Clownface` itself as well as array to create a multiple pointer context. Do refer to [the API page](api.md) for details about their parameters.
