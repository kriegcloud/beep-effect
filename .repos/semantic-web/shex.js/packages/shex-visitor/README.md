[![NPM Version](https://badge.fury.io/js/@shexjs%2Fvisitor.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/visitor
Visitor pattern for traversing [ShExJ](https://shex.io/shex-semantics/#shexj) schemas

## install

``` shell
npm install --save @shexjs/visitor
```

## Quick Start
The default behavior is to return a copy of the passed schema:
``` sh
node -e 'console.log(JSON.stringify(new (require("@shexjs/visitor"))()
  .visitSchema(
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
    }), null, 2))'
```
The result is will look identical to the input schema

## Strategy
The ShExJ format is defined in [JSG](http://shex.io/shex-semantics/index.html#shexj) or [Typescript](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/shexj/index.d.ts). The visitor API reflects both the names of the ShExJ attributes and their types. For example, by default, the `visitShapeAnd` calls `visitShapeExpr` on each of the conjuncts. Likewise, `visitTripleConstraint` calls `visitValueExpr` on the `.valueExpr` attribute, which in turn calles `visitShapeExpr` because that is the type of `.valueExpr`.

## Methods

* visitSchema(schema, ...args
* visitPrefixes(prefixes, ...args
* visitIRI(i, ...args
* visitImports(imports, ...args
* visitStartActs(startActs, ...args
* visitSemActs([semActs], ...args
* visitSemAct(semAct, label, ...args
* visitAnnotations([annotations], ...args
* TODO visitAnnotation(annotation, ...args
* visitShapes(shapes, ...args
* visitShapeDecl(decl, ...args
* visitShapeExpr(expr, ...args - calls one of the following
  * visitShapeOr(shapeExpr, ...args
  * visitShapeAnd(shapeExpr, ...args
  * visitShapeNot(expr, ...args
  * visitShapeRef(reference, ...args
  * visitShapeExternal(expr, ...args
  * visitNodeConstraint(shape, ...args
  * visitShape(shape, ...args
* visitExtra([extra], ...args
* visitExpression(expr, ...args - calls visitTripleExpr
* visitTripleExpr(expr, ...args - calls one of the following
  * visitOneOf(tripleExpr, ...args
  * visitEachOf(tripleExpr, ...args
  * visitTripleConstraint(expr, ...args
* visitValueExpr(shapeExpr, ...args
* visitValues(values, ...args
* visitValueExpr(shapeExpr, ...args
* visitStemRange(t, ...args
* visitExclusion(c, ...args
* visitInclusion(inclusion, ...args

### simple value visitors
* visitBase
* visitStart
* visitClosed
* "visit@context"
* visitInverse
* visitPredicate
* visitName
* visitId
* visitCode
* visitMin
* visitMax
* visitType
* visitNodeKind
* visitDatatype
* visitPattern
* visitFlags
* visitLength
* visitMinlength
* visitMaxlength
* visitMininclusive
* visitMinexclusive
* visitMaxinclusive
* visitMaxexclusive
* visitTotaldigits
* visitFractiondigits
* visitInclude

## index(schema)

The `index` function creates a visitor and overrides `visitExpression` and `visitShapeExpr` to provide an index composed of two maps:
* **shapeExprs** - map from shape declaration name to definition in `schema`,
* **tripleExprs** - map from triple expression name to definition in `schema`.

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

