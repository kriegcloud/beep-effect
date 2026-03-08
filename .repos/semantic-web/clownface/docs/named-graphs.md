# Working with named graphs

## Default behavior

The examples on all other pages do not specify any graph identifier. In this mode the traversal methods are free to navigate the entire dataset (aka. [union graph](https://patterns.dataincubator.org/book/union-graph.html)) but any triples added and removed only apply to the default graph.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')
const { nquads } = require('@tpluscode/rdf-string@0.2.26')

const tbbt = rdf.namespace('https://bigbangtheory.tv/') 

const quads = [
  rdf.quad(tbbt.Leonard, rdf.ns.schema.knows, tbbt.Amy, tbbt.Amy),
  rdf.quad(tbbt.Leonard, rdf.ns.schema.knows, tbbt.Sheldon, tbbt.Sheldon),
]

const leonard = rdf.clownface({ dataset: rdf.dataset(quads) })
  .namedNode(tbbt.Leonard)
  .addOut(rdf.ns.schema.name, 'Leonard')

console.log('Leonard knows ' + leonard.out(rdf.ns.schema.knows).values.join(', '))

nquads`${leonard.dataset}`.toString()
```

</run-kit>

## Single graph

A graph identifier can be passed to the factory call, which narrows down the context to only a specific graph.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')
const { nquads } = require('@tpluscode/rdf-string@0.2.26')

const tbbt = rdf.namespace('https://bigbangtheory.tv/') 

const quads = [
  rdf.quad(tbbt.Leonard, rdf.ns.schema.name, 'Leonard', tbbt.Leonard),
  rdf.quad(tbbt.Sheldon, rdf.ns.schema.name, 'Sheldon', tbbt.Sheldon),
]

// pass a NamedNode
// or use RDF.defaultGraph() for the default graph
const leonard = rdf.clownface({ dataset: rdf.dataset(quads), graph: tbbt.Leonard })
  .node(tbbt.Leonard)
  .addOut(rdf.ns.schema.knows, tbbt.Sheldon)

nquads`${leonard.dataset}`.toString()
```

</run-kit>
