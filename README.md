# @rdfjs/sink-map

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/sink-map/test.yaml?branch=master)](https://github.com/rdfjs-base/sink-map/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/sink-map.svg)](https://www.npmjs.com/package/@rdfjs/sink-map)

Map for [RDF/JS Sink](http://rdf.js.org/stream-spec/#sink-interface) including shortcut methods.

## Usage

The package provides Map from a string key to a Sink with a shortcut for `.import`.
Typical it's used to store parsers or serializers for specific media types.
As SinkMap extends from the [ECMAScript 2015 Map](https://www.ecma-international.org/ecma-262/6.0/#sec-map-objects) and doesn't overload any standard methods, methods like `set`, `get`, `has` or `delete` can be used as defined in the specification.

### Create a SinkMap
The constructor accepts arrays with key/sink pairs to fill the map:

```javascript
const map = new SinkMap([
  ['text/turtle', new ParserN3()]
])
```

It's also possible to create an empty map and add or extend it later using the `.set()` method:

```javascript
const map = new SinkMap()

map.set('text/turtle') = new ParserN3()
```

### Find a Sink

The `.get` method searches for the matching Sink and returns it:

```javascript
const map = new SinkMap([...])

const sink = map.get('text/turtle')

if (sink) {
  // found
} else {
  // not found
}
```

### Import shortcut

Usually you want to call the `.import` method of the matching Sink.
The map provides a shortcut for this.
It also has a `.import` method, but requires additionally the key as the first argument.
It returns `null` if no matching sink was found:

```javascript
const map = new SinkMap([...])

const input = fs.createReadStream('..')
const output = map.import('text/turtle', input)

if (output) {
  // found
} else {
  // not found
}
```

### Example

Here is a complete example where the map is used to store parsers and the `.import` shortcut is used to parse a string input:

```javascript
import SinkMap from '@rdfjs/sink-map'
import ParserN3 from '@rdfjs/parser-n3'
import { Readable } from 'readable-stream'

const map = new SinkMap([
  ['text/turtle', new ParserN3()]
])

const input = new Readable({
  read: () => {
    input.push(`
      PREFIX s: <http://schema.org/>

      [] a s:Person ;
        s:jobTitle "Professor" ;
        s:name "Jane Doe" ;
        s:telephone "(425) 123-4567" ;
        s:url <http://www.janedoe.com> .
    `)
    input.push(null)
  }
})

const output = map.import('text/turtle', input)

output.on('data', quad => {
  console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
})
```
