# clownface

[![Build Status](https://travis-ci.org/zazuko/clownface.svg?branch=master)](https://travis-ci.org/github/zazuko/clownface)
[![NPM Version](https://img.shields.io/npm/v/clownface.svg?style=flat)](https://npm.im/clownface)

Clownface is a graph traversal library inspired by [Gremlin](https://tinkerpop.apache.org/gremlin.html) which allows to query any [RDF dataset](https://rdf.js.org/dataset-spec/) in a concise and readable way.

Clownface greatly simplifies interacting with RDF data in JavaScript.

# Quick start

The recommended way is to use clownface with and RDF/JS environment.
It also requires [`DataFactory`](https://rdf.js.org/data-model-spec/#datafactory-interface) and [`DatasetFactory`](https://rdf.js.org/dataset-spec/#datasetfactory-interface), for example those provided by [`@rdfjs/data-model`](https://npm.im/@rdfjs/data-model) and [`@rdfjs/dataset`](https://npm.im/@rdfjs/dataset) packages respectively, as well as [`@rdfjs/namespace`](https://npm.im/@rdfjs/namespace).

```shell
npm install clownface @rdfjs/environment @rdfjs/data-model @rdfjs/dataset @rdfjs/namespace
````

```js
import Environment from '@rdfjs/environment/Environment.js'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import DataFactory from '@rdfjs/data-model/Factory.js'
import ClownfaceFactory from 'clownface/Factory.js'

const $rdf = new Environment([
  NamespaceFactory,
  DatasetFactory,
  DataFactory,
  ClownfaceFactory
])

const graph = $rdf.clownface()
```

Alternatively, if you already use [@zazuko/env](https://npm.im/@zazuko/env), it comes bundled with clownface and its dependencies.

```js
import $rdf from '@zazuko/env'

const graph = $rdf.clownface()
```

# Learn more

If you are new to RDF and JavaScript, consider our [Getting Started](https://zazuko.com/get-started/developers/#traverse-an-rdf-graph) guide that also covers Clownface basics.

For API documentation and examples, see http://zazuko.github.io/clownface/.
