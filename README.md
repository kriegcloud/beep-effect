# @rdfjs/traverser

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/traverser/test.yaml?branch=master)](https://github.com/rdfjs-base/traverser/actions/workflows/test.yaml)

[![npm version](https://img.shields.io/npm/v/@rdfjs/traverser.svg)](https://www.npmjs.com/package/@rdfjs/traverser)

This package provides a generic traverser for [RDF/JS Datasets](https://rdf.js.org/dataset-spec/).

## Usage

The main export of the package is the `Traverser` class.
It can be imported like this:

```javascript
import Traverser from '@rdfjs/traverser'
```

The package also provides a factory that can be used with [@rdfjs/environment](https://github.com/rdfjs-base/environment):

```javascript
import Environment from '@rdfjs/environment'
import TraverserFactory from '@rdfjs/traverser/Factory.js'

const env = new Environment([DataFactory, DatasetFactory, TraverserFactory])
```

### Traverser(filter, { backward, factory, forward })

Creates a new `Traverser` instance.
A `Traverser` contains only the rules for traversing.
The dataset and the starting point must be given to the methods.  

- `filter`: A filter function that returns a truthy value if the `Traverser` should traverse the given quad.
- `backward`: If true, traverse from object to subject. (default: `false`)
- `factory`: A RDF/JS factory that supports RDF/JS Datasets.
  The function will be called like this: `filter({ dataset, level, quad })`.
  - `dataset`: The RDF/JS Dataset that is traversed.
  - `level`: The number of quads followed until the filter was called.
  - `quad`: The current quad to process.
- `forward`: (default: `true`)

#### forEach ({ term, dataset }, callback)

Calls the given callback function for each quad matching the rules of the `Traverser`, starting from the given `term` and `dataset`.
The callback function is called like this: `callback({ dataset, level, quad })`.
 
- `dataset`: The RDF/JS Dataset that is traversed.
- `level`: The number of quads followed until the callback was called.
- `quad`: The current quad to process.

#### match ({ term, dataset })

Returns a RDF/JS Dataset that contains all quads matching the rules of the `Traverser`, starting from the given `term` and `dataset`.

#### reduce ({ term, dataset }, callback, initialValue)

Calls the given callback function for each quad matching the rules of the `Traverser`, starting from the given `term` and `dataset`.
The callback function is called like this: `callback({ dataset, level, quad }, result)`.

- `dataset`: The RDF/JS Dataset that is traversed.
- `level`: The number of quads followed until the callback was called.
- `quad`: The current quad to process.
- `result`: The return value of the previous call of the callback function.
  If it's called the first time, the `initialValue` is used.

### Factory

The constructor is called by the [@rdfjs/environment](https://github.com/rdfjs-base/environment).
The environment must support the [RDF/JS DatasetFactory](https://rdf.js.org/dataset-spec/) interface. 

#### traverser(filter, { backward = false, forward = true } = {})

Creates a new `Traverser` instance and returns it.

For more details, see the [Traverser](#traverserfilter--backward-factory-forward-) constructor section.
