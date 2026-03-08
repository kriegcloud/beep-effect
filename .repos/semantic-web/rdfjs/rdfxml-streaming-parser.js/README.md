# RDF/XML Streaming Parser

[![Build status](https://github.com/rdfjs/rdfxml-streaming-parser.js/workflows/CI/badge.svg)](https://github.com/rdfjs/rdfxml-streaming-parser.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rdfjs/rdfxml-streaming-parser.js/badge.svg?branch=master)](https://coveralls.io/github/rdfjs/rdfxml-streaming-parser.js?branch=master)
[![npm version](https://badge.fury.io/js/rdfxml-streaming-parser.svg)](https://www.npmjs.com/package/rdfxml-streaming-parser)

A [fast](https://gist.github.com/rubensworks/a351f394ca6b70d6ad4ec1adc691a453), _streaming_ [RDF/XML 1.2](https://www.w3.org/TR/rdf12-xml/) parser
that outputs [RDFJS](http://rdf.js.org/)-compliant quads.

## Installation

```bash
$ yarn install rdfxml-streaming-parser
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {RdfXmlParser} from "rdfxml-streaming-parser";
```

_or_

```javascript
const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser;
```

## Usage

`RdfXmlParser` is a Node [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform)
that takes in chunks of RDF/XML data,
and outputs [RDFJS](http://rdf.js.org/)-compliant quads.

It can be used to [`pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) streams to,
or you can write strings into the parser directly.

### Print all parsed triples from a file to the console

```javascript
const myParser = new RdfXmlParser();

fs.createReadStream('myfile.rdf')
  .pipe(myParser)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));
```

### Read all version attribute values

```javascript
const myParser = new RdfXmlParser();

fs.createReadStream('myfile.rdf')
  .pipe(myParser)
  .on('data', console.log)
  .on('version', console.log) // Log rdf:version attribute values
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));
```

The error thrown for unsupported versions can be skipped
by setting `parseUnsupportedVersions` to `true` when constructing the parser.

### Manually write strings to the parser

```javascript
const myParser = new RdfXmlParser();

myParser
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));

myParser.write('<?xml version="1.0"?>');
myParser.write(`<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">`);
myParser.write(`<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">`);
myParser.write(`<ex:prop />`);
myParser.write(`</rdf:Description>`);
myParser.write(`</rdf:RDF>`);
myParser.end();
```

### Import streams

This parser implements the RDFJS [Sink interface](https://rdf.js.org/#sink-interface),
which makes it possible to alternatively parse streams using the `import` method.

```javascript
const myParser = new RdfXmlParser();

const myTextStream = fs.createReadStream('myfile.rdf');

myParser.import(myTextStream)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));
```

## Configuration

Optionally, the following parameters can be set in the `RdfXmlParser` constructor:

* `dataFactory`: A custom [RDFJS DataFactory](http://rdf.js.org/#datafactory-interface) to construct terms and triples. _(Default: `require('@rdfjs/data-model')`)_
* `baseIRI`: An initial default base IRI. _(Default: `''`)_
* `defaultGraph`: The default graph for constructing [quads](http://rdf.js.org/#dom-datafactory-quad). _(Default: `defaultGraph()`)_
* `strict`: If the internal SAX parser should parse XML in strict mode, and error if it is invalid. _(Default: `false`)_
* `trackPosition`: If the internal position (line, column) should be tracked an emitted in error messages. _(Default: `false`)_
* `allowDuplicateRdfIds`: By default [multiple occurrences of the same `rdf:ID` value are not allowed](https://www.w3.org/TR/rdf-syntax-grammar/#section-Syntax-ID-xml-base). By setting this option to `true`, this uniqueness check can be disabled. _(Default: `false`)_
* `validateUri`: By default, the parser validates each URI. _(Default: `true`)_
* `iriValidationStrategy`: Allows to customize the used IRI validation strategy using the `IriValidationStrategy` enumeration. IRI validation is handled by [validate-iri.js](https://github.com/comunica/validate-iri.js/).  _(Default: `IriValidationStrategy.Pragmatic`)_
* `parseUnsupportedVersions`: If no error should be emitted on unsupported versions. _(Default: `false`)_
* `version`: The version that was supplied as a media type parameter. _(Default: `undefined`)_

```javascript
new RdfXmlParser({
  dataFactory: require('@rdfjs/data-model'),
  baseIRI: 'http://example.org/',
  defaultGraph: namedNode('http://example.org/graph'),
  strict: true,
  trackPosition: true,
  allowDuplicateRdfIds: true,
  validateUri: true,
  parseUnsupportedVersions: false,
});
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
