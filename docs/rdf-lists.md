# RDF Lists

RDF Lists are unavoidable when working with RDF data and their bare triples representation make it necessary to provide specialized programmatic APIs to handle.

Clownface comes with handy methods to create, iterate and remove lists from RDF datasets.

- `addList` method is similar to `addOut` but requires an array of object which it links as an `rdf:List`
- `list` method returns an `Iterator` of the values of an `rdf:List`
- finally `deleteList` removes the list nodes

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')
const { turtle } = require('@tpluscode/rdf-string@0.2.26')

const ex = rdf.namespace('http://example.com/')

const game = rdf.clownface()
  .namedNode(ex.game)

// Create a list with 3 elements 
game.addList(ex.score, [ex.score1, ex.score2, ex.score3])

// Add statements about the list elements
let scoreIndex = 1
for (const score of game.out(ex.score).list()) {
  score.addOut(rdf.ns.dtype.orderIndex, scoreIndex++)
}

// Remove the list but not statements about the individual scores
game.deleteList(ex.score)

turtle`${game.dataset}`.toString()
```

</run-kit>

## Handling non-lists

The `list()` method will return null when the object is not a list (such as a literal or without a `rdf:first`). A little bit of defensive programming can be employed to conditionally iterate a list or get the non-list objects of a property.

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')
const { turtle } = require('@tpluscode/rdf-string@0.2.26')

const ex = rdf.namespace('http://example.com/')

const game = rdf.clownface()
  .namedNode(ex.game)

// add object directly to ex:score
game.addOut(ex.score, [ex.score1, ex.score2, ex.score3])

// pretend we don't know if the value is a list of scores
const scores = game.out(ex.score)
const list = scores.list()

// iterate the raw objects as alternative
;(list && [...list]) || scores.toArray() 
```

</run-kit>
