# @rdfjs/dataset
[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/dataset/test.yaml?branch=master)](https://github.com/rdfjs-base/dataset/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/dataset.svg)](https://www.npmjs.com/package/@rdfjs/dataset)

An indexed implementation of the [RDF/JS Dataset](https://rdf.js.org/dataset-spec/) based on the great work by [Ruben Verborgh](https://github.com/RubenVerborgh) in [N3.js](https://github.com/rdfjs/N3.js).

## Usage

Use the following command to add the package as a dependency to your project:

```bash
npm install @rdfjs/dataset --save
```

The main entry point of the package exports an [RDF/JS DatasetCoreFactory](https://rdf.js.org/dataset-spec/#datasetcorefactory-interface) instance.
See the following lines on how to import and use the library:

```
import dataFactory from '@rdfjs/data-model'
import datasetFactory from '@rdfjs/dataset'

const quad = dataFactory.quad(
  dataFactory.blankNode(),
  dataFactory.namedNode('http://schema.org/name'),
  dataFactory.literal('RDF/JS Dataset')
)

const dataset = datasetFactory.dataset([quad])
```
