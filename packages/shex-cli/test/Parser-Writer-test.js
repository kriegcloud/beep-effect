//  "use strict";
const TEST_ShExR = "TEST_ShExR" in process.env ? JSON.parse(process.env["TEST_ShExR"]) : true;
const TEST_Vestiges = true;
const VERBOSE = "VERBOSE" in process.env;
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
const EARL = "EARL" in process.env; // We're generating an EARL report.
const BASE = "http://a.example/application/base/";

const Fs = require("fs");
const ShExParser = require("@shexjs/parser");
const ShExUtil = require("@shexjs/util");
const {ShExVisitor} = require("@shexjs/visitor");
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
const {ShExValidator} = require("@shexjs/validator");
const ShExWriter = require("@shexjs/writer");
const N3 = require("n3");
const ShExNode = require("@shexjs/node")({
  rdfjs: N3,
});

const {assert, expect} = require("chai");
const findPath = require("./findPath.js");

const schemasPath = findPath("schemas");
const jsonSchemasPath = findPath("parsedSchemas");
const manifestFile = schemasPath + "manifest.jsonld";
const ShExRSchemaFile = findPath("doc") + "ShExR.shex";
const negativeTests = [
  {path: findPath("negativeSyntax"), include: "Parse error"},
  {path: findPath("negativeStructure"), include: "Structural error"}
];
const illDefinedTestsPath = findPath("illDefined");
const nsPath = "http://www.w3.org/ns/shex#";

const parser = ShExParser.construct(BASE, null, {index: true});

const GraphSchema = loadGraphSchema();

// positive transformation tests
let schemas = parseJSONFile(manifestFile)["@graph"][0]["entries"];
if (TESTS)
  schemas = schemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

describe("Parser-Writer-test", function () {
  // const b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { /*parser._resetBlanks();*/ });

  function expectError (f, match) {
    let error = null;
    try {
      f();
    } catch (e) {
      error = e;
    }
    assert(error, "should have thrown an Error");
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.include(match);
  }

  if (!EARL && !TESTS) {
    // make sure errors are reported
    it("should throw an error on an invalid schema", function () {
      expectError(() => { parser.parse("this is an invalid ShEx schema"); },
                  "Parse error on line 1");
    });

    it("should throw an error on schema with \"nested\": in Shape", function () {
      expectError(() => {
        new ShExVisitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "Shape",
              "nested": true
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeNot", function () {
      expectError(() => {
        new ShExVisitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeNot",
              "nested": true,
              "shapeExpr": {
                "type": "NodeConstraint",
                "nodeKind": "iri"
              }
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeRef", function () {
      expectError(() => {
        new ShExVisitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeNot",
              "shapeExpr": {
                "type": "NodeConstraint",
                "nested": true,
                "nodeKind": "iri"
              }
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeAnd", function () {
      expectError(() => {
        new ShExVisitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeDecl",
              "shapeExpr": {
              "type": "ShapeAnd",
              "shapeExprs": [
                {
                  "type": "ShapeNot",
                  "shapeExpr": "http://ex.example/S",
                  "nested": true
                },
                "http://ex.example/S"
              ]
            } }
          ]
        });
      }, "unknown property: \"nested\"");
    });
  }

  schemas.forEach(function (test) {
    const schema = test.name;
    const meta = {base: null, prefixes: null}

    const jsonSchemaFile = jsonSchemasPath + test.json;
    try {
      const abstractSyntax = JSON.parse(Fs.readFileSync(jsonSchemaFile, "utf8"));
      const shexCFile = schemasPath + test.shex;
      const shexRFile = schemasPath + test.ttl;

      it(EARL
         ? 'schemas/manifest\#' + test.name
         : "should correctly parse ShExC schema '" + shexCFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           const schema = Fs.readFileSync(shexCFile, "utf8");
           if (VERBOSE) console.log("schema: [[\n" + schema + "\n]]");
             const parsedSchema = parser.parse(schema, BASE, {}, shexCFile);
             meta.base = parsedSchema._base;
             meta.prefixes = parsedSchema._prefixes;
             const canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("parsed:" + JSON.stringify(canonParsed));
             if (VERBOSE) console.log("expected:" + JSON.stringify(canonAbstractSyntax));
             expect(canonParsed).to.deep.equal(canonAbstractSyntax);
         });

    if (TEST_ShExR && !EARL) {
      it(EARL
         ? 'schemas/manifest\#' + test.name
         : "should correctly parse ShExR schema '" + shexRFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           const shexR = Fs.readFileSync(shexRFile, "utf8");
           if (VERBOSE) console.log("\nShExR:", shexR);
             const schemaGraph = new N3.Store();
             schemaGraph.addQuads(new N3.Parser({baseIRI: BASE, blankNodePrefix: "", format: "text/turtle"}).parse(shexR));
             // console.log(schemaGraph.getQuads());
             const schemaDriver = RdfJsDb(schemaGraph);
             const schemaRoot = schemaDriver.getQuads(null, ShExUtil.RDF.type, nsPath + "Schema")[0].subject;
             const graphParser = new ShExValidator(
               GraphSchema,
               schemaDriver,
               {  } // regexModule: require("@shexjs/eval-simple-1err") is no faster
             );
             const val = graphParser.validateNodeShapePair(schemaRoot, ShExValidator.Start); // start shape
             if ("errors" in val)
               throw Error(`${shexRFile} did not comply with ShExR.shex\n${JSON.stringify(val.errors, null, 2)}`);
             const parsedSchema = ShExUtil.canonicalize(ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val)))));
             const canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("transformed:" + JSON.stringify(parsedSchema));
             if (VERBOSE) console.log("expected:" + JSON.stringify(canonAbstractSyntax));
             // The order of nesting affects productions so don't look at them.
             delete canonParsed.productions;
             delete canonAbstractSyntax.productions;
             expect(canonParsed).to.deep.equal(canonAbstractSyntax);
         });
    }

      if (!EARL) {
        it("should duplicate '" + jsonSchemaFile + "' and produce the same structure.", function () {
          expect(new ShExVisitor().visitSchema(abstractSyntax)).to.deep.equal(abstractSyntax);
        });

        it("should write '" + jsonSchemaFile + "' and parse to the same structure.", function () {
          let w;
          new ShExWriter({simplifyParentheses: false, base: meta.base, prefixes: meta.prefixes}).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("\nwritten: [[\n" + w + "\n]]");
            const parsed2 = parser.parse(w, BASE, {}, shexCFile + " (generated)");
            if (VERBOSE) console.log("re-parsed:", JSON.stringify(parsed2));
            const canonParsed2 = ShExUtil.canonicalize(parsed2, BASE);
            const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
            expect(canonParsed2).to.deep.equal(canonAbstractSyntax);
        });

        it ("should write '" + jsonSchemaFile + "' with as few ()s as possible.", function () {
          let w;
          new ShExWriter({simplifyParentheses: true }).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("\nsimple: [[\n" + w + "\n]]");
          parser.parse(w, "http://should.not/appear", {}, shexCFile + " (simplified)"); // test that simplified also parses
        });
      }
    } catch (e) {
      const e2 = Error("Error in (" + jsonSchemaFile + "): " + e.message);
      e2.stack = "Error in (" + jsonSchemaFile + "): " + e.stack;
      throw e2;
    }
  });


  // negative syntax and structure tests
  negativeTests.forEach(testSet => {
    const manifest = testSet.path + "manifest.jsonld";
    let negSchemas = parseJSONFile(manifest)["@graph"][0]["entries"];
    if (TESTS)
      negSchemas = negSchemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

    negSchemas.forEach(function (test) {
      const path = testSet.path + test.shex;
      let dir = testSet.path.replace(/\/$/, '');
      dir = dir.substr(dir.lastIndexOf('/')+1);

      it(EARL
         ? dir + '/manifest#' + test.name
         : "should not parse schema '" + path + "'", function (report) {
        if (VERBOSE) console.log(test.name);
        ShExNode.load({shexc: [path]}, null, { parser: parser }, {}).
          then(function (loaded) {
            report(Error("Expected " + path + " to fail with " + testSet.include));
          }).
          catch(function (error) {
            try {
              expect(error).to.exist;
              expect(error).to.be.an.instanceof(Error);
              expect(error.message).to.include(testSet.include);
              if ("startRow" in test) {
                expect("location" in error).to.be.true;
                let x = " ../shexTest/negativeSyntax/" + test.shex;
                if (false && // for debugging and building tests
                    (!(error.location.first_line === test.startRow
                       ? error.location.first_column + 1 >= test.startColumn
                       : error.location.first_line > test.startRow) ||
                     !(error.location.last_line === test.endRow
                       ? error.location.last_column <= test.endColumn
                       : error.location.last_line < test.endRow)))
                  console.log(x, error.location, error.message)
                expect(error.location.first_line === test.startRow
                       ? error.location.first_column + 1 >= test.startColumn
                       : error.location.first_line > test.startRow).to.be.true;
                expect(error.location.last_line === test.endRow
                       ? error.location.last_column <= test.endColumn
                       : error.location.last_line < test.endRow).to.be.true;
              }
              report();
            } catch (e) {
              report(e);
            }
          });
      });
    });
  });


  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with indexing", function () {
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }

  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with pre-defined prefixes", function () {
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should allow temporarily overriding prefixes", function () {
        const schema = "PREFIX a: <http://a.example/xyz#> a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/xyz#a"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#b");
        expect(parser.parse("a:a { b:b .+ }")._index.shapeExprs["http://a.example/abc#a"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should not change the original prefixes", function () {
        expect(prefixes).to.deep.equal({ a: "http://a.example/abc#", b: "http://a.example/def#" });
      });

      it("should not take over changes to the original prefixes", function () {
        prefixes.a = "http://a.example/xyz#";
        expect(parser.parse("a:a { b:b .+ }")._index.shapeExprs["http://a.example/abc#a"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });

    describe("with pre-defined PNAME_NS prefixes", function () {
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a: { b: .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      it("should allow temporarily overriding prefixes", function () {
        const schema = "PREFIX a: <http://a.example/xyz#> a: { b: .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/xyz#"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#");
        expect(parser.parse("a: { b: .+ }")._index.shapeExprs["http://a.example/abc#"].shapeExpr.expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }
});

function loadGraphSchema () {
  if (TEST_ShExR) {
    const ret = parser.parse(Fs.readFileSync(ShExRSchemaFile, "utf8"), 'file://' + ShExRSchemaFile, {}, ShExRSchemaFile);

    // For testing, wrap TC.valueExprs in ShapeOr to allow references undefined shapes (i.e. no properties ergo empty shape).
    const valueExpr_tripleCnstrnt = ret._index.shapeExprs[nsPath + "TripleConstraint"].
          shapeExpr.expression.expressions.find(e => {
            return e.predicate === nsPath + "valueExpr";
          });
    valueExpr_tripleCnstrnt.valueExpr = { type: "ShapeOr",
                                          shapeExprs:
                                          [ valueExpr_tripleCnstrnt.valueExpr, // should be nsPath + "shapeDeclOrExpr"
                                            { type: "Shape", closed: true } ] }

    return ret;
  } else {
    console.warn("ShExR tests disabled");
    return null;
  }
}

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename, mapFunction) {
  "use strict";
  try {
    const string = Fs.readFileSync(filename, "utf8");
    const object = JSON.parse(string);
    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(object);
    return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
  } catch (e) {
    throw new Error("error reading " + filename +
                    ": " + ("stack" in e ? e.stack : e));
  }
}

// Not sure this is needed when everything's working but I have hunch it makes
// error handling a little more graceful.

// Stolen from Ruben Verborgh's SPARQL.js tests:
// Recursively replace values of "{undefined}" by `undefined`
function restoreUndefined(object) {
  "use strict";
  for (const key in object) {
    const item = object[key];
    if (typeof item === "object") {
      object[key] = restoreUndefined(item);
    } else if (item === "{undefined}") {
      object[key] = undefined;
    }
  }
  return object;
}

