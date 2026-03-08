# Graph traversal

A core functionality of clownface is moving between nodes along properties, or edges in graph lingo. That is done by chainable `out`/`in` methods which accept zero more properties as arguments. These methods move the graph pointer(s) from the current context by following properties where it is the `subject` or `object` respectively.

When called with no properties (or empty array), all properties are traversed and returned as a context of multiple graph pointers (if multiple nodes were found that is).

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

const dataset = await rdf.fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())

rdf.clownface({ dataset })
  .namedNode('http://localhost:8080/data/person/howard-wolowitz')
  .in(rdf.ns.schema.spouse)
  .out(rdf.ns.schema.knows)
  .out(rdf.ns.schema.address)
  .out(rdf.ns.schema.addressLocality)
  .values
```

</run-kit>

It is important that every call to `in` or `out` may return multiple pointers and they may be duplicate instances of the same node but are indistinguishable. If multiple predicates are used it is currently impossible to tell which one was traversed to reach any given node.

The above traversal would be equivalent to a SPARQL property path `^schema:spouse/schema:knows/schema:address/schema:addressLocality`.

## Node lookup

Another way for getting to the desired nodes is to find them using the `has` method. It has two parameters: properties and objects. The first one is required and narrows down the context to only those subjects where the property is used. The results can be narrowed down further by passing a second argument which filter to specific object.

Both those parameters and be a single value or an array.

When the context does not represent any pointer, all subjects from the dataset are considered.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

const dataset = await rdf.fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())

const howard = rdf.namedNode('http://localhost:8080/data/person/howard-wolowitz')

// all people whose spouse is Howard
const hasSpouse = rdf.clownface({ dataset })
  .has(rdf.ns.schema.spouse, howard)
  .values
```

</run-kit>
