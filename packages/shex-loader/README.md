[![NPM Version](https://badge.fury.io/js/@shexjs%2Feval-threaded-nerr.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/loader

Introduction
------------
This module provides HTTP access functions for @shexjs library. For `file:` access or dynamic loading of ShEx extensions, use `@shexjs/node`.

Installation
------------

### Node.js + npm

```
npm install @shexjs/loader
```

```js
const ShExIo = require('@shexjs/loader');
```

### Used with @shexjs suite:

#### core functions
* [@shexjs/loader](../loader) - HTTP access functions for @shexjs library
* [@shexjs/node](../node) - extend @shexjs/loader with file: access
* [@shexjs/term](../term) - RDF terms, relative URL resolution, JSON-LD terms
* [@shexjs/visitor](../visitor) - Walk a ShExJ object

#### parse and write ShExC
* [@shexjs/parser](../parser) - parse ShExC into (indexed) ShExJ
* [@shexjs/writer](../writer) - convert ShExJ as ShExC

* [@shexjs/util](../util) - misc utility functions

#### exectuables

* [@shexjs/cli](../cli) - command line interface for validation and format conversion
* [@shexjs/webapp](../webapp) - webpacks and the shex-simple interface

#### validation

* [shape-map](../map) - pairs of node/shape implementing ShapeMap

* [@shexjs/validator](../validator) - validate a fixed ShapeMap
* [@shexjs/eval-simple-1err](../eval-simple-1err) - fast regular expression engine stops on first error
* [@shexjs/eval-threaded-nerr](../eval-threaded-nerr) - thorough regular expression engine accumulates all errors

#### extensions

* [extension-test](../extension-test) - eval test suite extensions ([spec](http://shex.io/extensions/Test/))
* [extension-eval](../extension-eval) - eval javascript extensions ([spec](http://shex.io/extensions/Eval/))
* [extension-map](../extension-map) - implement [ShapeMap](http://shex.io/extensions/Map/)

#### ShapePath
* [@shexjs/shape-path-query](../shape-path-query) - ShapePath query interface for ShEx.js


### Methods

#### load(schema, data, schemaOptions = {}, dataOptions = {})

load shex and json files into a single ShEx schema and data into a graph.

SOURCE may be
* URL - where to load item.
* object: {text: string, url: string} - text and URL of already-loaded resource.
* (schema) ShExJ object
* (data) RdfJs data store

parameters:
* schema - { shexc: [ShExC SOURCE], json: [JSON SOURCE] }
* data - { turtle: [Turtle SOURCE], jsonld: [JSON-LD SOURCE] }
* schemaOptions
* dataOptions

returns: {Promise<{schema: any, dataMeta: *[], data: (*|null), schemaMeta: *[]}>}

example:
``` js
const N3 = require('n3'); // used for graph API example

// Initialize @shexjs/loader with implementations of APIs.
const ShExLoader = require("@shexjs/loader")({
  rdfjs: N3,                    // use N3 as an RdfJs implementation
  fetch: require('node-fetch'), // fetch implementation
  jsonld: require('jsonld')     // JSON-LD (if you need it)
});

// Schemas from URL, text and ShExJ:
const schemaFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex";

const schemaAsText = {          // ShExC schema and its location
  url: "http://a.example/schemaAsText",
  text: `
<#ShapeFromText> {
  <#p1> @<S1> # reference to Shape loaded from URL
}`
};

const schemaAsShExJ = {
  url: "http://a.example/ShExJ",
  schema: {
    type: "Schema",             // simple schema with single NodeConstraint
    shapes: [
      { "type": "ShapeDecl",
        "id": "http://a.example/S1", // overwrite S1 with NodeConstraint
        "shapeExpr": {
          "type": "NodeConstraint",
          "nodeKind": "iri",
          "pattern": "^https?:" } }
    ] }
};


// Data graphs from URL, text and graph API:
const graphFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl";

const graphAsText = {          // RDF graph and its location
  url: "http://a.example/graphAsText",
  text: `
<#N2> <#p2> "o2" . # reference to Shape loaded from URL`
};

const { namedNode, literal, defaultGraph, quad } = N3.DataFactory;
const graphFromApi = {
  url: "http://a.example/graphFromApi",
  graph: new N3.Store()
}
graphFromApi.graph.add(quad(
  namedNode('http://a.example/graphFromApi#N3'),
  namedNode('http://a.example/p3'),
  literal('o3'),
  defaultGraph(),
));


// ShExLoader.load returns a promise to load and merge schema and data.
function collisionPolicy (type, left, right) {
  console.log(type, 'collision between', left, right);
  return false; // keep left assignment (i.e. no reassignment)
}

const schemaAndDataP = ShExLoader.load(
  { shexc: [ schemaFromUrl, schemaAsText, schemaAsShExJ ] },
  { turtle: [ graphFromUrl, graphAsText, graphFromApi ] },
  { // schemaOptions
    collisionPolicy // print collisions and keep eariler assignment
    // instead of a function, could be string: 'left', 'right' or 'throw'
  }
);

// Print out results to show off returned structure.
schemaAndDataP.then(({schema, schemaMeta, data, dataMeta}) => {
  console.log('schemaMeta:\n' + JSON.stringify(schemaMeta, null, 2));
  console.log('shapes:\n' + schema.shapes.map(s => '  ' + s.id + ' is a ' + s.shapeExpr.type).join('\n'));
  console.log('dataMeta:\n' + JSON.stringify(dataMeta, null, 2));
  console.log('triples:\n' + data.getQuads().map(
    q => '  ' +
      (['subject', 'predicate', 'object'])
      .map(t => q[t].value).join(' ')).join('\n'));
});
```
output:
```
shapeDecl collision between {
  id: 'http://a.example/S1',
  type: 'ShapeDecl',
  shapeExpr: {
    type: 'Shape',
    expression: { type: 'OneOf', expressions: [Array] }
  }
} {
  type: 'ShapeDecl',
  id: 'http://a.example/S1',
  shapeExpr: { type: 'NodeConstraint', nodeKind: 'iri', pattern: '^https?:' }
}
schemaMeta:
[ { "mediaType": "text/shex", "url": "https:…cli/1dotOr2dot.shex",
    "base": "https:…cli/1dotOr2dot.shex", "prefixes": {} },
  { "mediaType": "text/shex", "url": "http://a.example/schemaAsText",
    "base": "http://a.example/schemaAsText", "prefixes": {} },
  { "mediaType": "text/shex", "url": "http://a.example/ShExJ",
    "prefixes": {}, "_prefixes": {} }
]
shapes:
  http://a.example/schemaAsText#ShapeFromText is a Shape
  http://a.example/S1 is a NodeConstraint
dataMeta:
[ { "mediaType": "text/turtle", "url": "http://a.example/graphFromApi",
    "base": "http://a.example/graphFromApi", "prefixes": {} },
  { "mediaType": "text/turtle", "url": "http://a.example/graphAsText",
    "base": "http://a.example/graphAsText", "prefixes": {} },
  { "mediaType": "text/turtle", "url": "https:…cli/p1.ttl",
    "base": "https:…cli/p1.ttl", "prefixes": { "": "http://a.example/" } }
]
triples:
  http://a.example/graphFromApi#N3 http://a.example/p3 o3
  http://a.example/graphAsText#N2 http://a.example/graphAsText#p2 o2
  https:…cli/x http://a.example/p1 p1-0
```

#### loadExtensions function(globs[])

prototype of loadExtensions. does nothing

#### GET function(url, mediaType)

return promise of {contents, url}

Examples
--------

Use `@shexjs/loader` directly:
```js
const ShExIo = require("@shexjs/loader")({
  rdfjs: N3,
  fetch: require('node-fetch')
});
```

Extend `@shexjs/loader` with jsonld and a non-standard jsonld document loader:
```js
const ShExIo = require("@shexjs/loader")({
  rdfjs: N3,
  fetch: require('node-fetch'),
  jsonld: require('jsonld'),
  jsonLdOptions: { documentLoader }
});

async function documentLoader (url, options) {
  # see https://github.com/digitalbazaar/jsonld.js#custom-document-loader
}
```

# Lerna Monorepo

This repo uses [lerna](https://github.com/lerna/lerna) to manage multiple NPM packages. These packages are located in `packages/*`:

- [`shape-map`](../shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](../shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](../shex-writer#readme) -- serialize ShExK as ShExC
- [`@shexjs/term`](../shex-term#readme) -- RDF terms uses in ShEx
- [`@shexjs/util`](../shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](../shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](../shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/eval-validator-api`](../eval-validator-api#readme) -- API called by [`@shexjs/validator`](../shex-validator#readme) for validating Shapes, with tripleExpressions and EXTENDS etc.
- [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which reports only one error.
- [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which exhaustively enumerate combinations of ways the data fails to satisfy a shape's expression.
- [`@shexjs/loader`](../shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](../shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](../shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](../shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](../shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](../extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](../extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](../extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))

