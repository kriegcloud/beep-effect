# @rdfjs/io

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/io/test.yaml?branch=master)](https://github.com/rdfjs-base/io/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/io.svg)](https://www.npmjs.com/package/@rdfjs/io)

This package provides I/O operations for RDF/JS streams and datasets.

## Usage

Depending on which kind of objects should be used for the I/O operations, there are three different options to import this package:

To import both, streams and datasets operations, use the main entrypoint:

```js
import * as io from '@rdfjs/io'
```

If only dataset operations are required:

```js
import * as datasetIo from '@rdfjs/io/dataset.js'
```

And, if only stream operations are required:

```js
import * as streamIo from '@rdfjs/io/stream.js'
```

### Factory Argument

All operations require a factory argument.
The factory must be an [Environment](https://www.npmjs.com/package/@rdfjs/environment) that bundles multiple other factories.
[FetchFactory](https://www.npmjs.com/package/@rdfjs/fetch-lite) and [FormatsFactory](https://www.npmjs.com/package/@rdfjs/formats) are required for the stream operations.
Additionally, the [DatasetFactory](https://www.npmjs.com/package/@rdfjs/dataset) is required for dataset operations.

## Examples

The following example loads a dataset from the given URL:

```js
import * as io from '@rdfjs/io'
import factory from './factory.js'

const url = 'https://housemd.rdf-ext.org/person/gregory-house'
const dataset = await io.dataset.fromURL(url, { factory })
```

The following example loads the quads of the given URL as a stream of quads:

```js
import * as io from '@rdfjs/io'
import factory from './factory.js'

const url = 'https://housemd.rdf-ext.org/person/gregory-house'
const stream = io.stream.fromURL(url, { factory })
```
