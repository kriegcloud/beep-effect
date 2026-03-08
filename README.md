# shacl-engine

[![build status](https://img.shields.io/github/actions/workflow/status/rdf-ext/shacl-engine/test.yaml?branch=master)](https://github.com/rdf-ext/shacl-engine/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/shacl-engine.svg)](https://www.npmjs.com/package/shacl-engine)

A fast [SHACL](https://www.w3.org/TR/shacl/) engine for data provided as [RDF/JS](http://rdf.js.org/data-model-spec/) objects.

The package can be tested on the [SHACL Playground](https://playground.rdf-ext.org/shacl/), which runs client-side in the browser.
Additionally, with [rdf-ext-cli](https://github.com/rdf-ext/rdf-ext-cli), there is a command-line tool for validating RDF data from files, URLs, or even SPARQL endpoints.

## Features

SHACL consists of multiple modules.
Here is an overview of SHACL features this library implements and planned features:

- [X] [SHACL Validation](https://www.w3.org/TR/shacl/#validation)
  - [X] [SHACL Core Constraint Components](https://www.w3.org/TR/shacl/#core-components)
  - [X] [SHACL SPARQL-based Constraints](https://www.w3.org/TR/shacl/#sparql-constraints)
  - [X] [SHACL SPARQL-based Targets](https://www.w3.org/TR/shacl/#sparql-based-targets)
- [ ] [SHACL JavaScript Extensions](https://www.w3.org/TR/shacl-js/)
- [ ] [SHACL Advanced Features](https://w3c.github.io/shacl/shacl-af/)

Additional features include:

- Debug output in the validation report, showing passed validations and traversing steps.
- Coverage support, providing a subgraph of all triples covered by the shape.

### Performance

The package offers significant performance improvements, being 15-26x faster than other JavaScript or Python packages.
It demonstrates a 15x speed boost in a benchmark that validates [shacl-shacl](https://www.w3.org/TR/shacl/#shacl-shacl) shapes against themselves, with even greater gains (26x faster) in larger, [real-world examples](https://github.com/rdf-ext/shacl-engine/issues/12#issuecomment-1940875628).
For more details about the benchmark, see [this blog post](https://www.bergnet.org/2023/03/2023/shacl-engine/).

## Install

```bash
npm install --save shacl-engine
```

## Usage

### Validator

The `Validator` class can be imported from the main package:

```javascript
import { Validator } from 'shacl-engine'
```

Or from the class file:

```javascript
import Validator from 'shacl-engine/Validator.js'
```

The constructor must be called with the shapes as an RDF/JS [DatasetCore](https://rdf.js.org/dataset-spec/#datasetcore-interface) object.
The second argument is an object for various options:

- `coverage`: Boolean flag to enable collecting covered quads. (*optional*)
  If coverage is enabled, `debug`, `details`, and `trace` are also enabled.
- `debug`: Generate debug results for successful validations. (*optional*)
- `details`: Generate nested result details. (*optional*)
- `factory`: A RDF/JS [DataFactory](http://rdf.js.org/data-model-spec/#datafactory-interface), which is used to generate the report (*required*).
- `trace`: Generate results for path traversing. (*optional*)

The validations can be executed with the `.validate(data, shapes)` method.
The data must have the following structure:

- `dataset`: An RDF/JS [DatasetCore](https://rdf.js.org/dataset-spec/#datasetcore-interface) object that contains the quads. (*required*)
- `terms`: An iterable object of RDF/JS [Terms](http://rdf.js.org/data-model-spec/#term-interface) that will be used as initial focus nodes. (*optional*)

The shapes object is optional, but if given must have the following structure:

- `terms`: An iterable object of RDF/JS [Terms](http://rdf.js.org/data-model-spec/#term-interface) that refers to the initial set of shapes. (*optional*)
  This doesn't limit the nested shapes.

#### Example

The following example reads the shapes and data from the list coverage test, creates a `Validator` instance, and runs the validation:

```javascript
import rdfDataModel from '@rdfjs/data-model'
import rdfDataset from '@rdfjs/dataset'
import toNT from '@rdfjs/to-ntriples'
import fromFile from 'rdf-utils-fs/fromFile.js'
import Validator from 'shacl-engine/Validator.js'

async function main () {
  // read the shape and data from the list coverage test
  const filename = new URL('../test/assets/coverage/list.ttl', import.meta.url)
  const dataset = rdfDataset.dataset()

  for await (const quad of fromFile(filename.pathname)) {
    dataset.add(quad)
  }

  // create a validator instance for the shapes in the given dataset
  const validator = new Validator(dataset, { factory: rdfDataModel })

  // run the validation process
  const report = await validator.validate({ dataset })

  // check if the data conforms to the given shape
  console.log(`conforms: ${report.conforms}`)
}

main()
```

See the `examples` folders for more examples.

### SPARQL Support

The `Validator` comes with the core SHACL validations out-of-the-box.
Additional validations and target resolvers must be added for full SPARQL support.
These can be imported from `shacl-engine/sparql.js` as shown below:

```javascript
import rdfDataModel from '@rdfjs/data-model'
import { targetResolvers, validations } from 'shacl-engine/sparql.js'

const validator = new Validator(dataset, {
  factory: rdfDataModel,
  targetResolvers,
  validations
})
```

The SPARQL plugin provides:

- `validations`: Support for [SPARQL-based Constraints](https://www.w3.org/TR/shacl/#sparql-constraints) (`sh:sparql`)
- `targetResolvers`: Support for [SPARQL-based Targets](https://www.w3.org/TR/shacl/#sparql-based-targets) (`sh:target` with `sh:select`)

Both are optional and can be used independently.
For example, to use only SPARQL-based targets without SPARQL constraints:

```javascript
import { targetResolvers } from 'shacl-engine/sparql.js'

const validator = new Validator(dataset, {
  factory: rdfDataModel,
  targetResolvers
})
```
