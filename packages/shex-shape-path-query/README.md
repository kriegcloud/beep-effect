# @shexjs/shape-path-query

NPM module to use [shape-path-core](https://github.com/shexSpec/ShapePath.js/tree/main/packages/core) to query data.

## API

``` javascript
const N3 = require("n3");
const Sp = require('shape-path-core')
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const yy = { // resolution for PNames in ShapePath
  base: new URL('http://project.example/schema'),
  prefixes: {
    'issue': 'http://project.example/ns#'
  }
}
const pathStr = '@issue:DiscItem ~ issue:href'
const pathExpr = new Sp.ShapePathParser(yy).parse(pathStr)
console.log(`${pathStr} compiles to ${JSON.stringify(pathExpr)}`)
const filePath = Issue.json
const schema = readJson('Issue.json')
const schemaNodes = pathExpr.evalPathExpr([schema], new EvalContext(schema))

const graph = new N3.Store();
const turtleStr = Fs.readFileSync('Issue2.ttl', 'utf8');
const parser = new N3.Parser({ baseIRI: 'http://a.example/' });
graph.addQuads(parser.parse(turtleStr));

const db = RdfJsDb(graph)
shapePathQuery (schema, nodeSet, db, node, shape)
```
1. schema: a ShExJ ShEx schema; should match `@types/shexj`
2. nodeSet: result of `evalPathExpr`
3. db: ShEx DB, e.g. the `@shexjs/neighborhood-rdfjs`
4. node: graph to start validation
5. shape: label of shape expression against which to validate
returns: hmm, not sure. at the simplest, an array of terms matched from the validated graph.

## quickstart

``` shell
./bin/spquery.js \
  '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>,@<http://project.example/schema#Issue>~<http://project.example/ns#spec>/valueExpr/shapeExprs~<http://project.example/ns#href>' \
  ../../node_modules/shape-path-core/examples/issue/Issue.json \
  -d ./examples/issue/Issue2.ttl \
  -m '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>'
```
or `npm run toy` from this directory

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

