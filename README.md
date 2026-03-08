# @rdfjs/score
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/score/test.yaml?branch=master)](https://github.com/rdfjs-base/score/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/score.svg)](https://www.npmjs.com/package/@rdfjs/score)

Scores RDF/JS terms inside a dataset

## Install

```bash
npm install @rdfjs/score --save
```

## Usage

### Factory

This package provides a factory that can be used with [`@rdfjs/environment`](https://github.com/rdfjs-base/environment).

```javascript
import DataFactory from '@rdfjs/environment/DataFactory.js'
import DatasetFactory from '@rdfjs/environment/DatasetFactory.js'
import Environment from '@rdfjs/environment'
import ScoreFactory from '@rdfjs/score/Factory.js'

const env = new Environment([DataFactory, DatasetFactory, ScoreFactory])
```

### combine(list)

Combines the result of multiple score functions of the same term into a single result and calculates the average score.

```javascript
import combine from '@rdfjs/score/combine.js'

const results = combine([score1, score2])(ptrs)
```

### combine.prioritized(list)

Combines the result of multiple score functions of the same term into a single result.
The new score is a combined value of the results of all score functions for the same term.
Priorities are used where the first function has the highest priority and the last one the lowest.

```javascript
import combine from '@rdfjs/score/combine.js'

const results = combine.prioritized([score1, score2])(ptrs)
```

### concat(list)

Concatenates the results of multiple score functions.

```javascript
import concat from '@rdfjs/score/concat.js'

const results = concat([score1, score2])(ptrs)
```

### count({ graph, object, predicate, subject = true })

Scores all given terms based on their occurrence.
The parts of the triple that should be taken into account must be given as boolean `true`.
By default, only the subject is taken into account.

```javascript
import count from '@rdfjs/score/count.js'

const results = count()(ptrs)
```

### distinct(results)

Reduces the list of results to unique terms.
The highest score for each term is used.

```javascript
import distinct from '@rdfjs/score/distinct.js'

const results = distinct(results)
```

### exists({ graph, object, predicate, subject })

Scores a quad with 1, if one of the given parts matches.
At least one part must be given.

```javascript
import exists from '@rdfjs/score/exists.js'

const results = exists({ subject: ns.ex.resource })(ptrs)
```

### fallback(list)

Calls one score function after another until a score function returns a result that is not empty.

```javascript
import fallback from '@rdfjs/score/fallback.js'

const results = fallback([score1, score2])(ptrs)
```

### fixed(term)

Scores the term that matches the given term with 1. 

```javascript
import fixed from '@rdfjs/score/fixed.js'

const results = fixed(ns.ex.resource)(ptrs)
```

### language(languages)

Score language literals based on the order of the given languages.
The `*` wildcard can be used to match any language.

```javascript
import language from '@rdfjs/score/language.js'

const results = language(['en', 'de', '*'])(ptrs)
```

### pageRank ({ alpha, epsilon })

Scores the given terms with the [PageRank](https://en.wikipedia.org/wiki/PageRank) algorithm.
Edges are only processed subject to object direction.

```javascript
import pageRank from '@rdfjs/score/pageRank.js'

const results = pageRank()(ptrs)
```

### pathDepth()

Scores the given terms by the level of the path.
Shorter path depths get scored better than deeper ones. 

```javascript
import pathDepth from '@rdfjs/score/pathDepth.js'

const results = pathDepth()(ptrs)
```

### prioritized(list)

Runs all score functions of the given list and prioritizes the score based on the position of the score function in the array.
Priorities are used where the first function has the highest priority and the last one the lowest.

```javascript
import prioritized from '@rdfjs/score/prioritized.js'

const results = prioritized([score1, score2])(ptrs)
```

### product(list)

Runs all score functions of the given list, combines the results with the same term, and scores it with the product of the individual results.

```javascript
import product from '@rdfjs/score/product.js'

const results = product()(ptrs)
```

### scale({ factor, score })

Calls the given score function and multiplies the score of the results with the given factor.

```javascript
import scale from '@rdfjs/score/scale.js'

const results = scale()(ptrs)
```

### sort(results)

Sorts the given results descending by score (best matches first).

```javascript
import sort from '@rdfjs/score/sort.js'

const sortedResults = sort(results)
```

### sortObjects({ dataset, objects, score, termCallback })

Scores and sorts the given objects, which must have a term attached.
The dataset must be given as an argument.
Optional a `termCallback` function can be given that extracts the term from the object.
By default, the term is expected as a property named `term`.

```javascript
import sortObjects from '@rdfjs/score/sortObjects.js'

const sortedObjects = sortObjects({
  dataset,
  objects,
  score,
  termCallback: object => object.ptr.term
})
```

### sum(list)

Runs all score functions of the given list, combines the results with the same term, and scores it with the sum of the individual results.

```javascript
import sum from '@rdfjs/score/sum.js'

const results = sum([score1, score2])(ptrs)
```

### type(type)

Scores all terms that are subjects of a resource with the given type with 1.

```javascript
import type from '@rdfjs/score/type.js'

const results = type(ns.schema.Person)(ptrs)
```
