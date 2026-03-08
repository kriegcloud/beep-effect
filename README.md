# @rdfjs/environment

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/environment/test.yaml?branch=master)](https://github.com/rdfjs-base/environment/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/environment.svg)](https://www.npmjs.com/package/@rdfjs/environment)

This package provides a flexible RDF/JS factory.
The `Environment` class takes one or more RDF/JS factory classes and creates a new, merged instance.
All factory methods will use the `Environment` instance as factory to create new object instances.
Clones can be created to manipulate an instance isolated from other instances.

## Usage

The main export of the package is the `Environment` class.
It can be imported like this:

```javascript
import Environment from '@rdfjs/environment'
```

The following example shows how to build an environment that is a combined factory of a [DataFactory](http://rdf.js.org/data-model-spec/#datafactory-interface) and [DatasetCoreFactory](https://rdf.js.org/dataset-spec/#datasetcorefactory-interface): 

```javascript
import DataFactory from '@@rdfjs/data-model/Factory.js'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import Environment from '@rdfjs/environment'

const env = new Environment([DataFactory, DatasetFactory])
```

### Environment(factories)

Creates a new `Environment` instance.
`factories` must be an iterable (e.g., `Array`) of RDF/JS factory classes.

#### clone()

This method creates a new, isolated `Environment` instance with the same set of factories and clones of the instance data.
