//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExUtil = require("..");

var fs = require("fs");
var expect = require("chai").expect;
var findPath = require("./findPath.js");

var schemasPath = findPath("parsedSchemas");
var jsonASTsPath = findPath("ASTs");
var negSyntaxTestsPath = findPath("negativeSyntax");
var illDefinedTestsPath = findPath("illDefined");

describe("A ShEx AST", function () {

  // positive transformation tests
  var schemas = fs.readdirSync(schemasPath);
  schemas = schemas.map(function (s) { return s.replace(/\.json$/, ""); });
  if (TESTS)
    schemas = schemas.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  schemas.sort();
  schemas.forEach(function (schemaName) {

    var jsonASTFile = jsonASTsPath + schemaName + ".json";
    if (!fs.existsSync(jsonASTFile)) return;
    var jsonSchemaFile = schemasPath + schemaName + ".json"

    it("should translate JSON schema '" + jsonSchemaFile + "' to '" + jsonASTFile + "'." , function () {
      var jsonAST = JSON.parse(fs.readFileSync(jsonASTFile, "utf8"));

      if (VERBOSE) console.log(schemaName);
      var schema = ShExUtil.ShExJtoAS(JSON.parse(fs.readFileSync(jsonSchemaFile, "utf8")));
      var compiledAST = ShExUtil.getAST(schema);
      if (VERBOSE) console.log("compiled :" + JSON.stringify(compiledAST));
      if (VERBOSE) console.log("expected :" + JSON.stringify(jsonAST));
      expect(compiledAST).to.deep.equal(jsonAST);
    });
  });
});

function parseShExJ (schemaText) {
  var schema = JSON.parse(schemaText);
  delete schema["@context"];
  if ("shapes" in schema) {
    var newShapes = {}
    schema.shapes.forEach(sh => {
      var label = sh.label;
      delete sh.label;
      newShapes[label] = sh;
    });
    schema.shapes = newShapes;
  }
  return schema;
}

