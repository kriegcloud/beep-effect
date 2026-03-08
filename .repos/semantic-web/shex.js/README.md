[![NPM Version](https://badge.fury.io/js/shex.png)](https://npmjs.org/package/shex)
[![Build Status](https://travis-ci.org/shexSpec/shex.js.svg?branch=main)](https://travis-ci.org/shexSpec/shex.js)
[![Coverage Status](https://coveralls.io/repos/github/shexSpec/shex.js/badge.svg?branch=jest)](https://coveralls.io/github/shexSpec/shex.js?branch=hest)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# shex.js
shex.js javascript implementation of Shape Expressions ([try online](https://rawgit.com/shexSpec/shex.js/main/packages/shex-webapp/doc/shex-simple.html))


## install

``` shell
npm install --save shex
```

## test

There are two ways to run tests. You can run the default tests for whichever branch you have checked out (including main):
``` shell
npm checkout shex-next
npm test
```
or you can clone shexSpec/shexTest next to your shex.js clone:
``` shell
(cd .. && git clone https://github.com/shexSpec/shexTest --branch extends)
npm test
```

The [test harness](test/findPath.js) first looks for a sibling shexTest repo and if it doesn't find it, uses `node_modules/shexTest`.

`test` runs `mocha -R dot` (the *dot* reporter because there are around three thousand tests).

There are slower tests (command line interface, HTTP, etc) which you can run with the `SLOW=<timeout in milliseconds>` environment variable set. For the HTTP tests you will have to specifiy a git repository in `$BRANCH`, e.g.
`SLOW=10000 BRANCH=main TEST-cli=true'npm test`


### branch-specific tests

The `shex.js` repo includes several branches for features that are in-flight in the ShEx Community Group. NPM `@shexjs/*` packages are published from the `shex-next` repo. Each of these repos depends on some branch of the test suite. The package.json file for each branch SHOULD have that corresponding shexTest branch à la:
``` json
  "shex-test": "shexSpec/shexTest#extends"
```
If you are running tests from the automatically checked out shexTest module, you'll have to `npm install` every time you change branches. If you are running from a sibling clone of shexTest, you'll have to cd to that sibling and checkout the branch which corresponds to the shex.js branch you have checked out.

There is a post-commit hook which will probably whine at you if they are misaligned, though it will simply fail to test some features if e.g. shexTest is on main while shex.js is on extends.

## validation

You can validate RDF data using the `bin/validate` executable or the `lib/ShExValidation` library described below.

###  validation executable

Validate something in HTTP-land:

```sh
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema.

```json
{
  "type": "test",
  "node": "http://shex.io/examples/Issue1",
  "shape": "http://shex.io/examples/IssueShape",
  "solution": {
...
  }
}
```

Had we gotten a `null`, we'd know that the document was invalid with respect to the schema.
See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

####  relative resolution

`validate`'s -n and -s arguemtns are evaluated as IRIs relative to the (first) data and schema sources respectively.
The above invocation validates the node `<Issue1>` in `http://shex.io/examples/Issue1.ttl`.
This and the shape can be written as relative IRIs:

```sh
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s IssueShape \
    -n Issue1
```


### validation library

Parsing from the old interwebs involves a painful mix of asynchronous callbacks for getting the schema and the data and parsing the data (shorter path below):
<a id="long-script"/>
```js
var shexc = "http://shex.io/examples/Issue.shex";
var shape = "http://shex.io/examples/IssueShape";
var data = "http://shex.io/examples/Issue1.ttl";
var node = "http://shex.io/examples/Issue1";

var http = require("http");
var shex = require("shex");
var n3 = require('n3');

// generic async GET function.
function GET (url, then) {
  http.request(url, function (resp) {
    var body = "";
    resp.on('data', function (chunk) { body += chunk; });
    resp.on("end", function () { then(body); });
  }).end();
}

var Schema = null; // will be loaded and compiled asynchronously
var Triples = null; // will be loaded and parsed asynchronously
function validateWhenEverythingsLoaded () {
  if (Schema !== null && Triples !== null) {
    console.log(new shex.Validator(Schema).validate(Triples, node, shape));
  }
}

// loaded the schema
GET(shexc, function (b) {
  // callback parses the schema and tries to validate.
  Schema = shex.Parser(shexc).parse(b)
  validateWhenEverythingsLoaded();
});

// load the data
GET(data, function (b) {
  // callback parses the triples and tries to validate.
  var db = n3.Store();
  n3.Parser({baseIRI: data, format: "text/turtle"}).parse(b, function (error, triple, prefixes) {
    if (error) {
      throw Error("error parsing " + data + ": " + error);
    } else if (triple) {
      db.addQuad(triple)
    } else {
      Triples = db;
      validateWhenEverythingsLoaded();
    }
  });
});
```

See? That's all there was too it!

OK, that's miserable. Let's use the ShExLoader to wrap all that callback misery:
<a name="loader-script"/>
```js
const shexc = "http://shex.io/examples/IssueSchema";  // schema location
const data = "http://shex.io/examples/Issue1";        // data location
const node = "http://shex.io/examples/Issue1#Issue1"; // node in that data

const N3 = require("n3");
const ShExLoader = require("@shexjs/loader")({        // initialize with:
  fetch: require('node-fetch'),                       //   fetch implementation
  rdfjs: N3,                                          //   RdfJs Turtle parser
});
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
const {ShExValidator} = require("@shexjs/validator");

ShExLoader.load({shexc: [shexc]}, {turtle: [data]})
  .then(function (loaded) {
    var db = RdfJsDb(loaded.data);
    var validator = new ShExValidator(loaded.schema, db, { results: "api" });
    const smap = [                                // array of node/shape pairs
      {node: node,                                //   JSON-LD @id for node
       shape: ShExValidator.Start}                //   schemas's start shape
    ]
    var result = validator.validateShapeMap(smap);  // success if no "errors"
    console.log(JSON.stringify(result, null, 2));
  } );
```

Note that the shex loader takes an array of ShExC schemas, either file paths or URLs, and an array of JSON schemas (empty in this invocation) and an array of Turtle files.

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
{ "type": "schema", "start": "http://shex.io/examples/IssueShape",
  "shapes": {
    "http://shex.io/examples/IssueShape": { "type": "shape",
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

### conversion by library

As with validation, the ShExLoader wrapes callbacks and simplifies parsing the libraries:

```js
var shexc = "http://shex.io/examples/Issue.shex";

var shex = require("shex");
shex.Loader.load({shexc: [shexc]}, null).then(function (loaded) {
    console.log(JSON.stringify(loaded.schema, null, "  "));
});
```

There's no actual conversion; the JSON representation is just the stringification of the parsed schema.


## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```sh
./node_modules/shex/bin/validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!

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
# ShEx2 features

## ShEx IMPORT Demo (with relative IRIs):

1. open a browser window (we'll call **validator**) with https://rawgit.com/shexSpec/shex.js/main/doc/shex-simple.html
2. open another browser window (we'll call **viewer**) with https://shex.io/shexTest/main/viewer?validation
3. wait 'till *viewer* loads and look for "3circRefS1-IS2-IS3-IS3" (near the bottom)
4. drag the "#3circRefS1-IS2-IS3-IS3" cell (or the ✓ to the left of it) to the right of the QueryMap area of *validator*
5. click on the long label under "Manifest:", then the long label under "Passing:" and validate.

It should validate, which involves the IMPORT of `3circRefS2-IS3` and `3circRefS3`.
`3circRefS2-IS3` also IMPORTs `3circRefS3` which shows that IMPORT is idempotent (has a side effect only the first time).

# lerna monorepo

This repo uses [lerna](https://github.com/lerna/lerna) to manage multiple NPM packages. These packages are located in `packages/*`:

- [`shape-map`](packages/shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](packages/shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](packages/shex-writer#readme) -- serialize ShExK as ShExC
- [`@shexjs/term`](packages/shex-term#readme) -- RDF terms uses in ShEx
- [`@shexjs/util`](packages/shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](packages/shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](packages/shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
!- [`@shexjs/eval-simple-1err`](packages/eval-simple-1err#readme) -- eval-simple-1err
- [`@shexjs/eval-threaded-nerr`](packages/eval-threaded-nerr#readme) -- eval-threaded-nerr
- [`@shexjs/loader`](packages/shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](packages/shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](packages/shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](packages/shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](packages/shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](packages/extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](packages/extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](packages/extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))



Here are some commands you'll need:

- building/testing
  - `lerna bootstrap` -- look for all packages in `packages/*`
  - `npm ci` -- to install root node_modules per package-lock.json
  - `lerna list` -- in case you ever wonder what packages flashed past your eyes
- adding an NPM package (`promise-worker`) to one of our managed packages (`webapp`)
  - `lerna add promise-worker --scope=@shexjs/webapp`
- remove a package you aren't using it after all:
  - edit e.g. the package.json (e.g. packages/shex-webapp/package.json) to remove the dependency
  - `lerna bootstrap --scope @shexjs/webapp --no-ci --force-local` ([why](https://github.com/lerna/lerna/issues/1886#issuecomment-531545220))
  - if it's in node_modules, `npm remove promise-worker`
- adding a dev package
  - shex.js follows [the advice of lerna docs](https://github.com/lerna/lerna/blob/main/doc/hoist.md) to "hoist" all dev dependencies to the root package (`hoist:true` in lerna.config). Lerna moves devDeps required in more than one package (e.g. the webpack deps in the webapp and extension-map packages) to the root so they won't appear in e.g. packages/extension-map/node_modules.
  - in principle, this should work: `lerna add -dev pseudo-worker --scope=@shexjs/webapp`
  - but it doesn't seem to so instead: `(cd packages/shex-webapp && npm install --save-dev pseudo-worker)`
