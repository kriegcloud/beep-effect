# Microdata to RDF Streaming Parser

[![Build status](https://github.com/rubensworks/microdata-rdf-streaming-parser.js/workflows/CI/badge.svg)](https://github.com/rubensworks/microdata-rdf-streaming-parser.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/microdata-rdf-streaming-parser.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/microdata-rdf-streaming-parser.js?branch=master)
[![npm version](https://badge.fury.io/js/microdata-rdf-streaming-parser.svg)](https://www.npmjs.com/package/microdata-rdf-streaming-parser)

A [fast](https://gist.github.com/rubensworks/ec15c73fe042441d74e1ba6157ccc7bc) and lightweight _streaming_ and 100% _spec-compliant_ [Microdata to RDF](https://w3c.github.io/microdata-rdf/) parser,
with [RDFJS](https://github.com/rdfjs/representation-task-force/) representations of RDF terms, quads and triples.

The streaming nature allows triples to be emitted _as soon as possible_, and documents _larger than memory_ to be parsed.

## Installation

```bash
$ npm install microdata-rdf-streaming-parser
```

or

```bash
$ yarn add microdata-rdf-streaming-parser
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {MicrodataRdfParser} from "microdata-rdf-streaming-parser";
```

_or_

```javascript
const MicrodataRdfParser = require("microdata-rdf-streaming-parser").MicrodataRdfParser;
```


## Usage

`MicrodataRdfParser` is a Node [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform)
that takes in chunks of Microdata to RDF data,
and outputs [RDFJS](http://rdf.js.org/)-compliant quads.

It can be used to [`pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) streams to,
or you can write strings into the parser directly.

## Configuration

Optionally, the following parameters can be set in the `MicrodataRdfParser` constructor:

* `dataFactory`: A custom [RDFJS DataFactory](http://rdf.js.org/#datafactory-interface) to construct terms and triples. _(Default: `require('@rdfjs/data-model')`)_
* `baseIRI`: An initial default base IRI. _(Default: `''`)_
* `defaultGraph`: The default graph for constructing [quads](http://rdf.js.org/#dom-datafactory-quad). _(Default: `defaultGraph()`)_
* `htmlParseListener`: An optional listener for the internal HTML parse events, should implement [`IHtmlParseListener`](https://github.com/rubensworks/rdfa-streaming-parser.js/blob/master/lib/IHtmlParseListener.ts) _(Default: `null`)_
* `xmlMode`: If the parser should assume strict X(HT)ML documents. _(Default: `false`)_
* `vocabRegistry`: A vocabulary registry to define specific behaviour for given URI prefixes. _(Default: contents of http://www.w3.org/ns/md)_

```javascript
new RdfaParser({
  dataFactory: require('@rdfjs/data-model'),
  baseIRI: 'http://example.org/',
  defaultGraph: namedNode('http://example.org/graph'),
  htmlParseListener: new MyHtmlListener(),
  xmlMode: true,
  vocabRegistry: {
    "http://schema.org/": {
      "properties": {
        "additionalType": {"subPropertyOf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"}
      }
    },
    "http://microformats.org/profile/hcard": {}
  },
});
```

## How it works

This tool makes use of the highly performant [htmlparser2](https://www.npmjs.com/package/htmlparser2) library for parsing HTML in a streaming way.
It listens to tag-events, and maintains the required tag metadata in a [stack-based datastructure](https://www.rubensworks.net/blog/2019/03/13/streaming-rdf-parsers/),
which can then be emitted as triples as soon as possible.

Our algorithm closely resembles the [suggested algorithm for transforming Microdata to RDF](https://w3c.github.io/microdata-rdf/#algorithm),
with a few changes to make it work in a streaming way.

If you want to make use of a different HTML/XML parser,
you can create a regular instance of `MicrodataRdfParser`,
and just call the following methods yourself directly:

* `onTagOpen(name: string, attributes: {[s: string]: string})`
* `onText(data: string)`
* `onTagClose()`

## Specification Compliance

This parser passes all tests from the [Microdata to RDF test suite](https://w3c.github.io/microdata-rdf/tests/).

## License

This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
