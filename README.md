# RDFa Streaming Parser

[![Build status](https://github.com/rubensworks/rdfa-streaming-parser.js/workflows/CI/badge.svg)](https://github.com/rubensworks/rdfa-streaming-parser.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdfa-streaming-parser.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdfa-streaming-parser.js?branch=master)
[![npm version](https://badge.fury.io/js/rdfa-streaming-parser.svg)](https://www.npmjs.com/package/rdfa-streaming-parser)

A [fast](https://gist.github.com/rubensworks/9eaaee548f647be15e98dea2b7d27586) and lightweight _streaming_ and 100% _spec-compliant_ [RDFa 1.1](https://rdfa.info/) parser,
with [RDFJS](https://github.com/rdfjs/representation-task-force/) representations of RDF terms, quads and triples.

The streaming nature allows triples to be emitted _as soon as possible_, and documents _larger than memory_ to be parsed.

## Installation

```bash
$ npm install rdfa-streaming-parser
```

or

```bash
$ yarn add rdfa-streaming-parser
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {RdfaParser} from "rdfa-streaming-parser";
```

_or_

```javascript
const RdfaParser = require("rdfa-streaming-parser").RdfaParser;
```


## Usage

`RdfaParser` is a Node [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform)
that takes in chunks of RDFa data,
and outputs [RDFJS](http://rdf.js.org/)-compliant quads.

It can be used to [`pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) streams to,
or you can write strings into the parser directly.

While not required, it is advised to specify the [profile](#profiles) of the parser
by supplying a `contentType` or `profile` constructor option.

### Print all parsed triples from a file to the console

```javascript
const myParser = new RdfaParser({ baseIRI: 'https://www.rubensworks.net/', contentType: 'text/html' });

fs.createReadStream('index.html')
  .pipe(myParser)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));
```

### Manually write strings to the parser

```javascript
const myParser = new RdfaParser({ baseIRI: 'https://www.rubensworks.net/', contentType: 'text/html' });

myParser
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));

myParser.write('<?xml version="1.0"?>');
myParser.write(`<!DOCTYPE html>
<html>

<head prefix="foaf: http://xmlns.com/foaf/0.1/">`);
myParser.write(`<link rel="foaf:primaryTopic foaf:maker" href="https://www.rubensworks.net/#me" />`);
myParser.write(`</head>`);
myParser.write(`<body>`);
myParser.write(`</body>`);
myParser.write(`</html>`);
myParser.end();
```

### Import streams

This parser implements the RDFJS [Sink interface](https://rdf.js.org/#sink-interface),
which makes it possible to alternatively parse streams using the `import` method.

```javascript
const myParser = new RdfaParser({ baseIRI: 'https://www.rubensworks.net/', contentType: 'text/html' });

const myTextStream = fs.createReadStream('index.html');

myParser.import(myTextStream)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'));
```

## Configuration

Optionally, the following parameters can be set in the `RdfaParser` constructor:

* `dataFactory`: A custom [RDFJS DataFactory](http://rdf.js.org/#datafactory-interface) to construct terms and triples. _(Default: `require('@rdfjs/data-model')`)_
* `baseIRI`: An initial default base IRI. _(Default: `''`)_
* `language`: A default language for string literals. _(Default: `''`)_
* `vocab`: The initial vocabulary. _(Default: `''`)_
* `defaultGraph`: The default graph for constructing [quads](http://rdf.js.org/#dom-datafactory-quad). _(Default: `defaultGraph()`)_
* `features`: A hash of features that should be enabled. Defaults to the features defined by the profile. _(Default: all features enabled)_
* `profile`: The [RDFa profile](#profiles) to use.  _(Default: profile with all features enabled)_
* `contentType`: The content type of the document that should be parsed. This can be used as an alternative to the 'profile' option. _(Default: profile with all features enabled)_
* `htmlParseListener`: An optional listener for the internal HTML parse events, should implement [`IHtmlParseListener`](https://github.com/rubensworks/rdfa-streaming-parser.js/blob/master/lib/IHtmlParseListener.ts) _(Default: `null`)_

```javascript
new RdfaParser({
  dataFactory: require('@rdfjs/data-model'),
  baseIRI: 'http://example.org/',
  language: 'en-us',
  vocab: 'http://example.org/myvocab',
  defaultGraph: namedNode('http://example.org/graph'),
  features: { langAttribute: true },
  profile: 'html',
  htmlParseListener: new MyHtmlListener(),
});
```

### Profiles

On top of [RDFa Core 1.1](https://www.w3.org/TR/rdfa-core/), there are a few RDFa variants that add specific sets of rules,
which are all supported in this library:

* [HTML+RDFa 1.1](https://www.w3.org/TR/rdfa-in-html/): Internally identified as the `'html'` profile with `'text/html'` as content type.
* [XHTML+RDFa 1.1](https://www.w3.org/TR/xhtml-rdfa/): Internally identified as the `'xhtml'` profile with `'application/xhtml+xml'` as content type.
* [SVG Tiny 1.2](https://www.w3.org/TR/2008/REC-SVGTiny12-20081222/metadata.html#MetadataAttributes): Internally identified as the `'xml'` profile with `'application/xml'`, `'text/xml'` and `'image/svg+xml'` as content types.

This library offers three different ways to define the RDFa profile or setting features:

* **Content type**: Passing a content type such as `'text/html'` to the `contentType` option in the constructor.
* **Profile string**: Passing `''`, `'core'`, `'html'`, `'xhtml'` or `'svg'` to the `profile` option in the constructor.
* **Features object**: A custom combination of features can be defined by passing a `features` option in the constructor.

The table below lists all possible RDFa features and in what profile they are available:

| Feature                          | Core | HTML | XHTML | XML | Description |
| -------------------------------- | ---- |----- | ----- | --- | ----------- |
| `baseTag`                        |      | ✓    | ✓     |     | If the baseIRI can be set via the `<base>` tag.            |
| `xmlBase`                        |      |      |       | ✓   | If the baseIRI can be set via the `xml:base` attribute.            |
| `langAttribute`                  |      | ✓    | ✓     | ✓   | If the language can be set via the language attribute.            |
| `onlyAllowUriRelRevIfProperty`   | ✓    | ✓    | ✓     |     | If non-CURIE and non-URI rel and rev have to be ignored if property is present.            |
| `inheritSubjectInHeadBody`       |      | ✓    | ✓     |     | If the new subject can be inherited from the parent object if we're inside `<head>` or `<body>` if the resource defines no new subject.            |
| `datetimeAttribute`              |      | ✓    | ✓     | ✓   | If the `datetime` attribute must be interpreted as datetimes.            |
| `timeTag`                        |      | ✓    | ✓     | ✓   | If the `<time>` tag contents should be interpreted as datetimes.            |
| `htmlDatatype`                   |      | ✓    | ✓     |     | If `rdf:HTML` as datatype should cause tag contents to be serialized to text.            |
| `copyRdfaPatterns`               | ✓    | ✓    | ✓     |     | If `rdfa:copy` property links can refer to rdfa:Pattern's for copying.            |
| `xmlnsPrefixMappings`            | ✓    | ✓    | ✓     | ✓   | If prefixes should be extracted from xmlns.            |
| `skipHandlingXmlLiteralChildren` |      |      |       |     | If children of rdf:XMLLiteral should not be handled as RDFa anymore. This is not part of the RDFa spec.            |
| `xhtmlInitialContext`            |      |      | ✓     |     | If the [XHTML initial context](https://www.w3.org/2011/rdfa-context/xhtml-rdfa-1.1) should be included in the initial prefixes.            |
| `roleAttribute`                  |      | ✓    | ✓     | ✓   | If the [role attribute](https://www.w3.org/TR/role-attribute/#using-role-in-conjunction-with-rdfa) should be handled.            |

## How it works

This tool makes use of the highly performant [htmlparser2](https://www.npmjs.com/package/htmlparser2) library for parsing HTML in a streaming way.
It listens to tag-events, and maintains the required tag metadata in a [stack-based datastructure](https://www.rubensworks.net/blog/2019/03/13/streaming-rdf-parsers/),
which can then be emitted as triples as soon as possible.

Our algorithm closely resembles the [suggested processing sequence](https://www.w3.org/TR/rdfa-core/#s_sequence),
with a few minor changes to make it work in a streaming way.

If you want to make use of a different HTML/XML parser,
you can create a regular instance of `RdfaParser`,
and just call the following methods yourself directly:

* `onTagOpen(name: string, attributes: {[s: string]: string})`
* `onText(data: string)`
* `onTagClose()`

## Specification Compliance

This parser passes all tests from the [RDFa 1.1 test suite](http://rdfa.info/dev).
More specifically, the following manifests are explicitly tested:

* HTML+RDFa 1.1 (HTML4)
* HTML+RDFa 1.1 (HTML5)
* HTML+RDFa 1.1 (XHTML5)
* SVGTiny+RDFa 1.1
* XHTML+RDFa 1.1
* XML+RDFa 1.1

The following _optional_ features for RDFa processors are supported:

* [Processing the `@role` attribute.](https://www.w3.org/TR/role-attribute/#using-role-in-conjunction-with-rdfa)

The following _optional_ features for RDFa processors are _not_ supported (yet):

* [Emitting the Processor Status as triples.](https://www.w3.org/TR/rdfa-core/#processor-status)
* [Performing vocabulary expansion based on an OWL subset.](https://www.w3.org/TR/rdfa-core/#s_vocab_expansion)

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
