# @rdfjs/data-model
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/data-model/test.yaml?branch=master)](https://github.com/rdfjs-base/data-model/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/data-model.svg)](https://www.npmjs.com/package/@rdfjs/data-model)

A basic implementation of the [RDF/JS Data Model](http://rdf.js.org/data-model-spec/).

## Usage

Use the following command to add the package as a dependency to your project:

```bash
npm install @rdfjs/data-model --save
```

The main entry point of the package exports an [RDF/JS DataFactory](http://rdf.js.org/data-model-spec/#datafactory-interface) instance.
See the following lines on how to import and use the library:

```
import dataFactory from '@rdfjs/data-model'

const quad = dataFactory.quad(
  dataFactory.blankNode(),
  dataFactory.namedNode('http://schema.org/name'),
  dataFactory.literal('RDF/JS Data model')
)
```
