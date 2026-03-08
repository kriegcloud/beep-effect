# @rdfjs/formats

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/formats/test.yaml?branch=master)](https://github.com/rdfjs-base/formats/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/formats.svg)](https://www.npmjs.com/package/@rdfjs/formats)

This module bundles parsers and serializers for the most common RDF formats.
Instances of [SinkMap](https://github.com/rdfjs-base/sink-map) are used to handle different media types.

## Usage

The formats object has a `parsers` and `serializers` property.
Each is an instance of `SinkMap` with the most common RDF media types as key.
The formats object is exported as default and can be imported like this:

```javascript
import formats from '@rdfjs/formats'
```

### Pretty-Print Serializers

The default bundle of serializers is optimized for streaming.
The pretty-print formats bundle can be used if a more human-readable output is required.
It can be imported like this:

### Factory

A factory that takes care of parsers and serializers.
An additional `.formats` object will be attached to the environment.
That object is compatible with the data structure of [@rdfjs/formats-common](https://github.com/rdfjs-base/formats-common).
The `.formats` object has an additional `.import()` function to import other format bundles.
The following code shows how to import the [@rdfjs/formats-common](https://github.com/rdfjs-base/formats-common) bundle:


```javascript
import formats from '@rdfjs/formats/pretty.js'
```

## Example

The following example uses the parser for the media type `text/turtle` to parse the given string.
The quads emitted by the `data` event are written to the console:

```javascript
import formats from '@rdfjs/formats'
import { Readable } from 'readable-stream'

const input = Readable.from([`
  PREFIX s: <http://schema.org/>

  [] a s:Person;
    s:jobTitle "Professor";
    s:name "Jane Doe";
    s:telephone "(425) 123-4567";
    s:url <http://www.janedoe.com>.
`])

const output = formats.parsers.import('text/turtle', input)

output.on('data', quad => {
  console.log(`quad: ${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
})

output.on('prefix', (prefix, ns) => {
  console.log(`prefix: ${prefix} ${ns.value}`)
})
```
