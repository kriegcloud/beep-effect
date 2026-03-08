[![NPM Version](https://badge.fury.io/js/@shexjs%2Feval-threaded-nerr.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/cli

Command line tools for ShEx.

##  validation executable

### Validate over HTTP:
```sh
./node_modules/.bin/shex-validate \
    -x http://shex.io/examples/IssueSchema \
    -d http://shex.io/examples/Issue1 \
    -s http://shex.io/examples/IssueSchema#IssueShape \
    -n http://shex.io/examples/Issue1#Issue1
```

That validates node `http://shex.io/examples/Issue` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueSchema#IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema.

```json
{
  "type": "ShapeTest",
  "node": "http://shex.io/examples/Issue1#Issue1",
  "shape": "http://shex.io/examples/IssueSchema#IssueShape",
  "solution": {
    …
  }
}
```
The '-x' (shex) indicates a ShEx compact syntax file, which is the preferred type on shex.io; `-j … examples/IssueSchema.json` selects ShExJ and `-t … examples/IssueSchema.ttl` selects ShExR.

Had we gotten a `Failure`, we'd know that the document was invalid with respect to the schema. For instance, tru this again changing `#Issue1` to `#User2` (because that User2 should not conform to IssueShape):
``` json
{
  "type": "Failure",
  "node": "http://shex.io/examples/Issue1#User2",
  "shape": "http://shex.io/examples/IssueSchema#IssueShape",
  "errors": [
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#state",
      "valueExpr": {
        "type": "NodeConstraint",
        "values": [
          "http://ex.example/ns#unassigned",
          "http://ex.example/ns#assigned"
        ]
      }
    },
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#reportedBy",
      "valueExpr": "http://shex.io/examples/IssueSchema#UserShape"
    },
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#reportedOn",
      "valueExpr": {
        "type": "NodeConstraint",
        "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
      }
    }
  ]
}
```

See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

### Validate local files:
Command line arguments which don't match "^(blob:)?[a-z]+://." (and don't start with 'file:') are assumed to be file paths.
```sh
./node_modules/.bin/shex-validate \
    -x ./node_modules/shex-examples/IssueSchema.shex \
    -d ./node_modules/shex-examples/Issue1.ttl \
    -s '#IssueShape' \
    -n '#Issue1'
```
Note that the -s (--shape) and the -n (--node) are relative to the schema and data locations respectively.
This means you don't have to try to construct the entire file: URL.

In the output, we'll see that the response has file: URLs in it:
``` json
{
  "type": "ShapeTest",
  "node": "file:///…/examples/Issue1.ttl#Issue1",
  "shape": "file:///…/examples/IssueSchema.shex#IssueShape",
  "solution": {
    …
  }
}
```

Of course the schema can use http: and the data file: or visa-versa.

Happy validating!



### Validation server:

The `-S` switch specifies a URL at which to run a validation server:
```sh
./node_modules/.bin/shex-validate \
    -S http://localhost:1234/validate \
    -x ./node_modules/shex-examples/IssueSchema.shex \
    -d ./node_modules/shex-examples/Issue1.ttl \
    -s '#IssueShape' \
    -n '#Issue1'
```
The output of this command will direct you to
  `http://localhost:1234/validate`.
Because you supplied all necessary parameters in the invocation, by default, this server will validate `#Issue1` in `Issue1.ttl` against `#IssueShape` in `IssueSchema.shex`. If you play override the node
  `http://localhost:1234/validate?node=%23Issue2`
(note that with curl, you must encode the '#' as "%23"), you will see an error because that node has no arcs out in that graph.

#### POSTing with curl

`curl` offers a convenient way to construct POST requests. Supposed you wanted a validation server with no default schema or data:
```sh
./node_modules/.bin/shex-validate -S http://localhost:1234/validate
```
You could submit all the parameters as body parameters in a POST:
```
curl -i http://localhost:1234/validate \
  -F "schema=@./node_modules/shex-examples/IssueSchema.shex" \
  -F "shape=#IssueShape" \
  -F "data=@./node_modules/shex-examples/Issue1.ttl" \
  -F "node=#Issue1"
```
(prefixing a curl -F value with an '@' reads from the following filename)

you can mix and match between URL search string and body parameters:
```
curl -i http://localhost:1234/validate?node=%23Issue1 \
  -F "schema=@./node_modules/shex-examples/IssueSchema.shex" \
  -F "shape=#IssueShape" \
  -F "data=@./node_modules/shex-examples/Issue1.ttl"
```
(Don't forget to escape the '#' as "%23".)

## conversion

As with validation (above), you can convert by either executable or library.

###  conversion executable

ShEx can be represented in the compact syntax
```
PREFIX ex: <http://ex.example/#>
<IssueShape> {                       # An <IssueShape> has:
    ex:state (ex:unassigned            # state which is
              ex:assigned),            #   unassigned or assigned.
    ex:reportedBy @<UserShape>        # reported by a <UserShape>.
}
```
or in JSON:
```json
{ "type": "schema", "start": "http://shex.io/examples/IssueSchema#IssueShape",
  "shapes": {
    "http://shex.io/examples/IssueSchema#IssueShape": { "type": "shape",
      "expression": { "type": "eachOf",
        "expressions": [
          { "type": "tripleConstraint", "predicate": "http://ex.example/#state",
            "valueExpr": { "type": "valueClass", "values": [
                "http://ex.example/#unassigned", "http://ex.example/#assigned"
          ] } },
          { "type": "tripleConstraint", "predicate": "http://ex.example/#reportedBy",
            "valueExpr": { "type": "valueClass", "reference": "http://shex.io/examples/UserShape" }
          }
] } } } }
```

You can convert between them with shex-to-json:
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex
```
and, less elegantly, back with json-to-shex.

## materialize

Materialize is used to transform from a source schema to a target schema after validation is done.

The syntax is:
```sh
materialize `-t <target schema>`|-h [-j `<JSON Vars File>`] [-r `<RDF root IRI>`]
```
Materialize reads the output from the validate tool from STDIN and maps it to the specified target schema.

If supplied, a JSON vars file will be referenced to fill in constant values not specified from the source.
This is useful in assigning default fields to the target when there is no equivalent value in the source schema
and source data.

Here is an example of a simple JSON vars file:
```json
{
  "urn:local:Demographics:constSys": "System",
}
```
If this vars file content is used, then any time a variable in the target file with
value "urn:local:Demographics:constSys" is seen, the value "System will be substituted.

The RDF root IRI specifies the root node from which all nodes in the schema will descend.
The default root if none is specified is: ` tag:eric@w3.org/2016/root `

Here are some examples:
```sh
materialize -h
```
```sh
validate -x source_schema.shex -l data.jsonld -s ProblemShape | materialize -t target_schema.shex -j vars.json
```
```sh
cat problem.val | materialize -t target_schema.shex -j vars.json -r http://hl7.org/fhir/shape/problem
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

