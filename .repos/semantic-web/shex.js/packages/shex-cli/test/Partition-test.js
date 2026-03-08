var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env["TESTS"].split(/,/) : null;

var ShExParser = require("@shexjs/parser");
var ShExUtil = require("@shexjs/util");

var fs = require('fs');
var expect = require('chai').expect;
var findPath = require('./findPath.js');

var schemasPath = findPath('schemas');
var partitionedSchemasPath = __dirname + '/../test/partitionedSchemas/';
var manifestFile = __dirname + '/../test/partitionedSchemas/Manifest.json';

describe('Partitioning', function () {
  var parser = ShExParser.construct();

  var manifest = parseJSON(fs.readFileSync(manifestFile, 'utf8'));
  if (TESTS)
    manifest.tests = manifest.tests.filter(function (t) {
      return TESTS.indexOf(t.from) !== -1 || TESTS.indexOf(t.expect) !== -1;
    });

  manifest.tests.forEach(function (test) {

    var schemaFile = schemasPath + test.from + ".shex";
    var expectedFile = partitionedSchemasPath + test.expect + ".shex";
    var schema = parser.parse(fs.readFileSync(schemaFile, 'utf8'));
    var partition = ShExUtil.partition(schema, test.include);
    var expected = parser.parse(fs.readFileSync(expectedFile, 'utf8'));

    it((VERBOSE ? schemaFile : test.from) + 
       ' for ' + test.include.join(', ') + ' should match ' + 
       (VERBOSE ? expectedFile : test.expect), function () {
      if (VERBOSE) console.log("schema: ", JSON.stringify(schema));
      if (VERBOSE) console.log("include: ", JSON.stringify(test.include));
      if (VERBOSE) console.log("partition: ", JSON.stringify(partition));
      if (VERBOSE) console.log("expect: ", JSON.stringify(expected));
      expect(partition).to.deep.equal(expected);
    });
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  var object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
}

