# JSON-LD Streaming Serializer

[![Build status](https://github.com/rubensworks/jsonld-streaming-serializer.js/workflows/CI/badge.svg)](https://github.com/rubensworks/jsonld-streaming-serializer.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/jsonld-streaming-serializer.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/jsonld-streaming-serializer.js?branch=master)
[![npm version](https://badge.fury.io/js/jsonld-streaming-serializer.svg)](https://www.npmjs.com/package/jsonld-streaming-serializer)

A fast and lightweight _streaming_ [JSON-LD](https://json-ld.org/) serializer,
with [RDFJS](https://github.com/rdfjs/representation-task-force/) representations of RDF terms, quads and triples.

The streaming nature allows JSON-LD chunks to be emitted _as soon as possible_, and RDF streams _larger than memory_ to be serialized.

## Installation

```bash
$ npm install jsonld-streaming-serializer
```

or

```bash
$ yarn add jsonld-streaming-serializer
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {JsonLdSerializer} from "jsonld-streaming-serializer";
```

_or_

```javascript
const JsonLdSerializer = require("jsonld-streaming-serializer").JsonLdSerializer;
```


## Usage

`JsonLdSerializer` is a Node [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform)
that takes in [RDFJS](http://rdf.js.org/) quads,
and outputs string chunks of JSON-LD data.

It can be used to [`pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) [quad streams](http://rdf.js.org/stream-spec/#stream-interface) to,
or you can write [RDF quads](http://rdf.js.org/data-model-spec/#quad-interface) into the serializer directly.

### Pretty-print given triples to the console

By default, this parser will serialize everything as compact as possible on a single line (but chunked).
Using the `space` option, the output can be pretty-printed for improving human-readability.

```javascript
const dataFactory = require('@rdfjs/data-model');
const mySerializer = new JsonLdSerializer({ space: '  ' });
mySerializer.pipe(process.stdout);

mySerializer.write(dataFactory.triple(
  dataFactory.namedNode('http://ex.org/s1'),
  dataFactory.namedNode('http://ex.org/p1'),
  dataFactory.namedNode('http://ex.org/o1'),
));
mySerializer.write(dataFactory.triple(
  dataFactory.namedNode('http://ex.org/s1'),
  dataFactory.namedNode('http://ex.org/p1'),
  dataFactory.namedNode('http://ex.org/o2'),
));
mySerializer.end();
```

### Pipe a stream of triples

```javascript
const mySerializer = new JsonLdSerializer();

myTripleStream
    .pipe(mySerializer)
    .pipe(process.stdout);
```

### Import streams

This serializer implements the RDFJS [Sink interface](https://rdf.js.org/#sink-interface),
which makes it possible to alternatively parse streams using the `import` method.

```javascript
const mySerializer = new JsonLdSerializer();

mySerializer.import(myTripleStream)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were serialized!'));
```

### Write @list's

Since RDF lists can not be detected in a streaming-way
without waiting until the stream ends,
this serializer offers `list()` an alternative way to serialize RDF list
using JSON-LD's `@list` keyword.

```javascript
const dataFactory = require('@rdfjs/data-model');
const mySerializer = new JsonLdSerializer({ space: '  ' });
mySerializer.pipe(process.stdout);

mySerializer.write(dataFactory.triple(
  dataFactory.namedNode('http://ex.org/s1'),
  dataFactory.namedNode('http://ex.org/p1'),
  await mySerializer.list([
    dataFactory.namedNode('http://ex.org/o1'),
    dataFactory.namedNode('http://ex.org/o2'),
    dataFactory.namedNode('http://ex.org/o3'),
  ]),
));
mySerializer.end();
```

### Compact with a context

Optionally, a context (or baseIRI) can be provided to the serializer,
which will make the parser output this context into the stream (unless `excludeContext` is false),
and all terms will attempted to be compacted based on this context.

****External context:****
```javascript
const mySerializer = new JsonLdSerializer({
  context: 'http://schema.org/',
});
```

****Inline context:****
```javascript
const mySerializer = new JsonLdSerializer({
  context: {
    termA: 'http://ex.org/a',
    termB: 'http://ex.org/B',
  },
});
```

****Array context:****
```javascript
const mySerializer = new JsonLdSerializer({
  context: [
    {
      termA: 'http://ex.org/a',
      termB: 'http://ex.org/B',
    },
    'http://schema.org/'
  ],
});
```

## Restrictions

While this serializer outputs valid JSON-LD 1.1 and JSON-LD-star,
it does not fully comply with all the specification tests,
as these assume non-streaming processing.

As such, this serializer has the following restrictions:

* RDF lists are not converted to `@list` arrays. However, the `list()` helper method can be manually called to achieve this.
* `rdfDirection: 'compound-literal'` is not supported, as this may require keeping the whole stream in-memory.
* No deduplication of triples, as this would require keeping the whole stream in-memory.

## Configuration

Optionally, the following parameters can be set in the `JsonLdSerializer` constructor:

* `space`: An optional indentation string that should be used when stringifying JSON. _(Default: `null`)_
* `context`: An optional root context to use while serializing. It will also try to compact as many terms as possible based on the compacting capabilities of [jsonld-context-parser](https://github.com/rubensworks/jsonld-context-parser.js). This context will be emitted to the stream, unless `excludeContext` is set to false. _(Default: `null`)_
* `baseIRI`: An optional base IRI for compacting terms. It will enhance the context with a `@base` entry. This will also cause a context to be emitted unless `excludeContext` is set to false. _(Default: `null`)_
* `excludeContext`: If a `context` or `baseIRI` is set, the context will be emitted into the output stream, unless this option is set to `true`. _(Default: `false`)_
* `useRdfType`: An optional boolean indicating if rdf:type predicates should be emitted directly, instead of @type. _(Default: `false`)_
* `useNativeTypes`: An optional boolean indicating if literals should be converted to primitive types, such as booleans and integers. _(Default: `false`)_
* `rdfDirection`: The [mode](https://w3c.github.io/json-ld-api/#dom-jsonldoptions-rdfdirection) under which `@direction` should be handled. If undefined, `@direction` is considered a regular RDF 1.2 literal with a base direction. Alternatively, it can be set to either `'i18n-datatype'` or `'compound-literal'` _(Default: `undefined`)_

```javascript
new JsonLdSerializer({
  space: '  ',
  context: 'https://schema.org/',
  baseIRI: 'http://example.org/',
  excludeContext: true,
  useRdfType: true,
  useNativeTypes: true,
  rdfDirection: 'i18n-datatype',
});
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
