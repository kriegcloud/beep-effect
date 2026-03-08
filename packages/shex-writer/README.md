[![NPM Version](https://badge.fury.io/js/@shexjs%2Fwriter.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/writer
Write [ShExJ](https://shex.io/shex-semantics/#shexj) as [ShExC](https://shex.io/shex-semantics/#shexc)

## install

``` shell
npm install --save @shexjs/writer
```

## Quick Start
Invoke from the command line:
``` sh
node -e 'new (require("@shexjs/writer"))()
  .writeSchema(
    {
      "type": "Schema",
      "shapes": [
        {
          "id": "http://a.example/S1",
          "type": "Shape",
          "expression": {
            "type": "TripleConstraint",
            "predicate": "http://a.example/p1",
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                {
                  "value": "1",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                },
                {
                  "value": "2",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                }
              ]
            }
          }
        }
      ]
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
The result is a ShExJ expression of the input schema:
``` shex
<http://a.example/S1> {
  <http://a.example/p1> [1 2]
}
```

## option: base - Base IRI for terse relative URLs
Providing a Base IRI (see [MDN docs for URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)) allows you to parse schemas with relative URLs for e.g. shape and property names:
``` sh
node -e 'new (require("@shexjs/writer"))({
    base: "http://a.example/"
  })
  .writeSchema(
    {
      "type": "Schema",
      "shapes": [
        {
          "id": "http://a.example/S1",
          "type": "Shape",
          "expression": {
            "type": "TripleConstraint",
            "predicate": "http://a.example/p1",
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                {
                  "value": "1",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                },
                {
                  "value": "2",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                }
              ]
            }
          }
        }
      ]
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
``` shex
BASE <http://a.example/>
<S1> {
  <p1> [1 2]
}
```

## option: prefixes - Pre-loaded namespace prefixes
A second parameter to `construct` is a map for prefixes that are not defined in the schema:
``` sh
node -e 'new (require("@shexjs/writer"))({
    base: "http://a.example/",
    prefixes: {
      "": "http://a.example/path/path3#",
      v: "http://a.example/vocab#"
    }
  })
  .writeSchema(
    {
      "type": "Schema",
      "shapes": [
        {
          "id": "http://a.example/path/S1",
          "type": "Shape",
          "expression": {
            "type": "TripleConstraint",
            "predicate": "http://a.example/path/path3#p1",
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                "http://a.example/vocab#v1",
                "http://a.example/vocab#v2"
              ]
            }
          }
        }
      ]
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
``` shex
PREFIX : <http://a.example/path/path3#>
PREFIX v: <http://a.example/vocab#>

BASE <http://a.example/>
<path/S1> {
  :p1 [v:v1 v:v2]
}
```

# option: simplifyParentheses
`simplifyParentheses: true` eliminates ()s to the degree possible using the ShExC parsing precedunce rules. For example, a ()'d EachOf expression:

``` shex
<S1> {
(    <p1> . ;
     <p2> @<S2>?)
}
```
will be serialized without the ()s:
``` shex
<S1> {
    <p1> . ;
    <p2> @<S2>?
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

