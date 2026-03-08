[![NPM Version](https://badge.fury.io/js/@shexjs%2Fwriter.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/writer
Utility functions to work with [ShExJ](https://shex.io/shex-semantics/#shexj) schemas

## install

``` shell
npm install --save @shexjs/writer
```

## Invocation
Using `Partition(<schema>, [<URL>s])` as an example, an illustrative way to invoke from it from the command line uses `@shexjs/parser` and `@shexjs/writer`:
``` sh
node -e 'const base = "http://a.example/"
  const schema = require("@shexjs/parser")
    .construct(base, {v: "http://a.example/vocab#"})
    .parse("<S1> { <p1> .; <p2> @<S2>? } <S2> { <p3> @<S3> } <S3> { <p4> @<S1> } <S4> { <p5> . }")
  const partition = require("@shexjs/util").partition(schema, [base + "S2"])
  new (require("@shexjs/writer"))({ base, simplifyParentheses: true })
    .writeSchema(partition,
      (error, text, prefixes) => {
        if (error)
          throw error;
        console.log(text);
      })'
```
The result is a ShExJ expression of the input schema:
``` shex
BASE <http://a.example/>
<S2> {
  <p3> @<S3>
}
<S3> {
  <p4> @<S1>
}
<S1> {
    <p1> . ;
    <p2> @<S2>?
}
```
Note that `<S2>` in the input schema has no references to `<S1>`:
``` shex
<S1> {
  <p1> .;
  <p2> @<S2>?
}
<S2> {
  <p3> @<S3>
}
<S3> {
  <p4> @<S1>
}
<S4> {
  <p5> .
}
```

## ShExJtoAS(schema)
Parse a ShExJ schema and add `._prefixes` and `._index` for efficient processing within shexj.js

## ShExAStoJ(schema)
Remove `._prefixes` and `._index` from internal schema structure and add `schema["@context"] || "http://www.w3.org/ns/shex.jsonld"`

## ShExRVisitor:(knownShapeExprs), ShExRtoShExJ(schema-like-object)
Internal functions for parsing ShExR

## canonicalize(schema, trimIRI)
Normalize ShExJ by moving all tripleExpression references to their first expression.

## BiDiClosure
construct an object with this api:

* **needs**: {} - mapping from needer to needie
* **neededBy**: {} - reverse mapping of `needs`
* add(needer, needie, negated) - record that needer referenced needied, possibly in a negation

## nestShapes(schema, options = {})
See which shape declarations have no coreferences and can be nested inside their sole referrer.

### options
 *   **no**: don't do anything; just report nestable shapes
 *   **transform**: function to change shape labels

## getPredicateUsage(schema, untyped = {})
Return which predicates appear in which shapes, what their common type is, and whether they are polymorphic.

## getDependencies(schema, ret)
Find which shappes depend on other shapes by inheritance or inclusion.

## Partition(<schema>, [<URL>s])
Create subset of a schema with only desired shapes and their dependencies.

## merge(left, right, overwrite, inPlace)
Merge right schema onto left schema if `inPlace` is true; otherwise return a new merged schema.
`overwrite`: boolean specifies whether to replace and old shape declaration with a new one of the same name.

## absolutizeResults(res, base)
In validation resutls with some relative URLs in it, re-evaluate all [`shape`, `reference`, `node`, `subject`, `predicate`, `object`] property values against `base`.

## getProofGraph(res, db, dataFactory)
Parse a validation result and call `db.addQuad()` with each triple involved in validation.

**Note**, this may call `db.addQuad()` multiple times with the same triple if that triple appears more than once in the validation results.

## isWellDefined(schema)
Verify that schema has all necessary referents and conforms to ShEx's stratified negation rules.

## valuesToSchema(values)
Convert the results of validating an instance of ShExR against ShExR.shex into a ShExJ schema.

## errsToSimple(failure)
Attempt to make a validation failure human-readable.

## executeQuery(query, endpoint, dataFactory)
Synchronously Execute a SPARQL query against and endpoint.

## executeQueryPromise(query, endpoint, dataFactory)
Asynchronously Execute a SPARQL query against and endpoint.

## parseSparqlJsonResults (jsonObject)
Parse JSON results to internal RDF term representations.

## parseSparqlXmlResults_dom(doc)
Parse XML results in a DOM to internal RDF term representations.

## parseSparqlXmlResults_jquery(jqObj)
Parse XML results to internal RDF term representations using JQuery.

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

