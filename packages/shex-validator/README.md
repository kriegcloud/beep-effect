[![NPM Version](https://badge.fury.io/js/@shexjs%2Fvalidator.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/validator
Validator pattern for traversing [ShExJ](https://shex.io/shex-semantics/#shexj) schemas

## install

``` shell
npm install --save @shexjs/validator
```

## Invocation
Using `Partition(<schema>, [<URL>s])` as an example, an illustrative way to invoke from it from the command line uses `@shexjs/parser` and `N3.js`:
``` js
const ShExParser = require('@shexjs/parser');
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const {ShExValidator} = require('@shexjs/validator');
const {Parser: N3Parser, Store: N3Store} = require('n3');
const base = 'http://a.example/';

const shexc = `
<S1> {
  <p1> . ;
  <p2> . ;
}`;

const turtle = `
<n1> <p1> 1 ; <p3> 2 . # missing p2
<n2> <p4> 1 ; <p2> 2 . # missing p1
`;

const schema = ShExParser.construct(base)
      .parse(shexc);
const g = new N3Store();
new N3Parser({baseIRI: base}).parse(turtle, (error, quad, prefixes) => {
  if (quad)
    g.addQuad(quad);
  else
    console.log(JSON.stringify(
      new ShExValidator(schema, RdfJsDb(g))
        .validate([{node: base + 'n1', shape: base + 'S1'},
                   {node: base + 'n2', shape: base + 'S1'}]),
      null, 2 # stringify args
    ));
});

```
The result is a JSON structure which reports the expected errors
``` json
{
  "type": "FailureList",
  "errors": [
    {
      "type": "Failure",
      "node": "http://a.example/n1",
      "shape": "http://a.example/S1",
      "errors": [
        {
          "type": "MissingProperty",
          "property": "http://a.example/p2"
        }
      ]
    },
    {
      "type": "Failure",
      "node": "http://a.example/n2",
      "shape": "http://a.example/S1",
      "errors": [
        {
          "type": "MissingProperty",
          "property": "http://a.example/p1"
        }
      ]
    }
  ]
}
```

## Validation Proof
If we correct the two errors in the above Turtle:
``` turtle
<n1> <p1> 1 ; <p2> 2 . # fixed missing p2
<n2> <p1> 3 ; <p2> 4 . # fixed missing p1
```
, the validator gives us a proof of conformance:
``` json
{
  "type": "SolutionList",
  "solutions": [
    {
      "type": "ShapeTest",
      "node": "http://a.example/n1",
      "shape": "http://a.example/S1",
      "solution": {
        "type": "EachOfSolutions",
        "solutions": [
          {
            "type": "EachOfSolution",
            "expressions": [
              {
                "type": "TripleConstraintSolutions",
                "predicate": "http://a.example/p1",
                "solutions": [
                  {
                    "type": "TestedTriple",
                    "subject": "http://a.example/n1",
                    "predicate": "http://a.example/p1",
                    "object": {
                      "value": "1",
                      "type": "http://www.w3.org/2001/XMLSchema#integer"
                    }
                  }
                ]
              },
              {
                "type": "TripleConstraintSolutions",
                "predicate": "http://a.example/p2",
                "solutions": [
                  {
                    "type": "TestedTriple",
                    "subject": "http://a.example/n1",
                    "predicate": "http://a.example/p2",
                    "object": {
                      "value": "2",
                      "type": "http://www.w3.org/2001/XMLSchema#integer"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      "type": "ShapeTest",
      "node": "http://a.example/n2",
      "shape": "http://a.example/S1",
      "solution": {
        "type": "EachOfSolutions",
        "solutions": [
          {
            "type": "EachOfSolution",
            "expressions": [
              {
                "type": "TripleConstraintSolutions",
                "predicate": "http://a.example/p1",
                "solutions": [
                  {
                    "type": "TestedTriple",
                    "subject": "http://a.example/n2",
                    "predicate": "http://a.example/p1",
                    "object": {
                      "value": "3",
                      "type": "http://www.w3.org/2001/XMLSchema#integer"
                    }
                  }
                ]
              },
              {
                "type": "TripleConstraintSolutions",
                "predicate": "http://a.example/p2",
                "solutions": [
                  {
                    "type": "TestedTriple",
                    "subject": "http://a.example/n2",
                    "predicate": "http://a.example/p2",
                    "object": {
                      "value": "4",
                      "type": "http://www.w3.org/2001/XMLSchema#integer"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## Specifying Shape Evaluator
The triple expression in a Shape is essentially a fancy regular expression. shex.js ships with two evaluators:

* **eval-threaded-nerr** (default) - Exhaustively enumerate combinations of ways the data fails to satisfy a shape's expression.
* **eval-simple-1err** - Report only one error.

You can specify which module to use with the schema options parameter to the validator constructor:
``` js
      new ShExValidator(schema, RdfJsDb(g), {
        regexModule: require('@shexjs/eval-simple-1err')
      })
```

## External Shapes
One form of ShEx extensibility is the declaration of external shapes:
``` shex
<S1> {
  <p1> @<S2>
}
<S2> EXTERNAL
```
These must be supplied to your validator but the ShEx specification does not specify how. In ShExJS, these must be supplied as a constructor argument:
``` js
      new ShExValidator(schema, RdfJsDb(g), {
        regexModule: require('@shexjs/eval-simple-1err'),
        validateExtern: myValidator
      })

function myValidator (point, shapeLabel, ctx) { // (RdfJs.Term, string, ShapeExprValidationContext) -> ShExV.shapeExprTest
  if (shapeLabel === "http://a.example/S2") {
    const p2z = g.getQuads(point, 'http://a.example/p2', null);
    if (p2z.length === 1) {
      return {
        "type": "ShapeTest",
        "node": "_:b0",
        "shape": "http://a.example/S2",
        "solution": {
          "type": "TripleConstraintSolutions",
          "predicate": "http://a.example/p2",
          "solutions": [
            {
              "type": "TestedTriple",
              "subject": point,
              "predicate": "http://a.example/p2",
              "object": p2z[0].object.value
            }
          ]
        }
      };
    }
  }
}
```
Failure to supply an external validator function when validating a schema with external shapes will result in an exception:
```
TypeError: this.options.validateExtern is not a function
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

