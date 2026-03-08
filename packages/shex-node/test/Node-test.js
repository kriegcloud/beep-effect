"use strict"
const VERBOSE = "VERBOSE" in process.env
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null
const expect = require("chai").expect
const Path = require('path')
const TestDir = Path.join(__dirname, "../../shex-cli/test");
const ShExUtil = require("@shexjs/util");
const {StoreDuplicates} = require("@shexjs/util/lib/Merger");

const [[GitRootServer]] = require('../../../tools/testServer')
      .startServer( [
        { url: 'https://shex.io/webapps/',
          fromDir: Path.join(__dirname, '../../..') }
      ] );

// Initialize @shexjs/loader with implementations of APIs.
const ShExLoader = require("..")({
  rdfjs: require('n3'),         // use N3 as an RdfJs implementation
  fetch: require('node-fetch'), // fetch implementation
  jsonld: require('jsonld')     // JSON-LD (if you need it)
})

// Schemas from URL and filepath:
const schemaFromFile =
      Path.join(TestDir, "cli/1dotOr2dot.shex")
const schemaFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex"

// Data graphs from URL, text and graph API:
const graphFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl"
const graphFromFile =
      Path.join(TestDir, "cli/p2p3.ttl")

function fixupFilePaths (yylloc) {
  return {
    filename: "file://" + Path.join(__dirname, yylloc.filename),
    importers: yylloc.importers.map(i => "file://" + Path.join(__dirname, i)),
    first_line: yylloc.first_line, first_column: yylloc.first_column,
    last_line: yylloc.last_line, last_column: yylloc.last_column,
  };
}

function makeTestLocationAggregator() {
  return {
    // locates emulate StoreDuplicates.duplicates (in order to reuse expected results).
    locations: {},
    overwrite: function (type, left, right, leftLloc, rightLloc, leftMeta, rightMeta) {
      if (type == "shapeDecl") {
        if (!this.locations[left.id])
          this.locations[left.id] = [{...leftLloc, importers: leftMeta.importers}];
        this.locations[left.id].push({...rightLloc, importers: rightMeta.importers});
      }
      return false; // keep the left
    },
  };
}

describe("@shexjs/node", function () {

  // could break this up into multiple tests
  it("should load schema and data from URLs and files" , async function () {

    // ShExLoader.load returns a promise to load and merge schema and data.
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ schemaFromFile, schemaFromUrl ] },
      { turtle: [ graphFromUrl, graphFromFile ] },
      { // schemaOptions
        // index: true,
        collisionPolicy: 'right' // keep the later S1 shape declaration (from file)
      }
    )
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { mediaType: "text/shex", url: "file://" + Path.join(TestDir, "cli/1dotOr2dot.shex"), importers: [],
        base: "file://" + Path.join(TestDir, "cli/1dotOr2dot.shex"), prefixes: {"": "http://a.example/"} },
      { mediaType: "text/shex", url: "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", importers: [],
        base: "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", prefixes: {"": "http://a.example/"} }
    ])
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type])
    expect(loadedShapes).to.deep.equal([
      ["http://a.example/S1", "Shape"],
    ])
    expect(dataMeta).to.deep.equal([
      { mediaType: "text/turtle", url: "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl", importers: [],
        base: "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl", prefixes: {
          "": "http://a.example/"
        } },
      { mediaType: "text/turtle", url: "file://" + Path.join(TestDir, "cli/p2p3.ttl"), importers: [],
        base: "file://" + Path.join(TestDir, "cli/p2p3.ttl"), prefixes: {
          "": "http://a.example/",
          "xsd": "http://www.w3.org/2001/XMLSchema#" } }
    ])
    const quads = data.getQuads().sort((l, r) => l.subject.value.localeCompare(r.subject.value))
    const quadStrs = quads.map(q => (['subject', 'predicate', 'object']).map(t => q[t].value))
    expect(quadStrs).to.deep.equal([
      ["file://" + Path.join(TestDir, "cli/x"), "http://a.example/p2", "p2-0"],
      ["file://" + Path.join(TestDir, "cli/x"), "http://a.example/p3", "p3-0"],
      ["https://shex.io/webapps/packages/shex-cli/test/cli/x", "http://a.example/p1", "p1-0"]
    ])
  })

  describe("collisionPolicy", function () {
    describe("default", function () {
      it("should reject on re-declared shapes with no" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
        ).then(() => {throw Error(`load should have failed`);}, rejected => {
          expect(rejected).to.match(/collides with/);
        });
      });
    });

    describe("string", function () {
      it("should accept re-declared shapes with 'left'" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: "left" },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(undefined)
        );
      });

      it("should accept re-declared shapes with 'right'" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: "right" },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(true)
        );
      });

      it("should reject re-declared shapes with 'throw'" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: "throw" },
        ).then(() => {throw Error(`load should have failed`);}, rejected => {
          expect(rejected).to.match(/collides with/);
        });
      });
    });

    describe("function", function () {
      it("should accept re-declared shapes with left" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: () => false },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(undefined)
        );
      });

      it("should accept re-declared shapes with right" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: () => true },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(true)
        );
      });

      it("should reject re-declared shapes with restrictive" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: () => { throw Error("BANG!"); } },
        ).then(() => {throw Error(`load should have failed`);}, rejected => {
          expect(rejected.message).to.equal("BANG!");
        });
      });
    });

    describe("class", function () {
      it("should accept re-declared shapes with left" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: { overwrite: () => false } },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(undefined)
        );
      });

      it("should accept re-declared shapes with right" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: { overwrite: () => true } },
        ).then(
          resolved => expect(resolved.schema.shapes.find(
            decl => decl.id.endsWith('PersonShape')
          ).shapeExpr.closed).to.eq(true)
        );
      });

      it("should reject re-declared shapes with restrictive" , async () => {
        return ShExLoader.load(
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          undefined,
          { collisionPolicy: { overwrite: () => { throw Error("BANG!"); } } },
        ).then(() => {throw Error(`load should have failed`);}, rejected => {
          expect(rejected.message).to.equal("BANG!");
        });
      });
    });

    describe("reassignment locations", function () {
      const expectedDuplicates = {
        "http://a.example/PersonShape": [
          {
            filename: "../../shex-cli/test/Imports/TrompPerson/User.shex",
            importers: [],
            first_line: 10, first_column: 0,
            last_line: 15, last_column: 1,
          },
          {
            filename: "../../shex-cli/test/Imports/TrompPerson/Employee.shex",
            importers: [
              "../../shex-cli/test/Imports/TrompPerson/Issue.shex",
            ],
            first_line: 13, first_column: 0,
            last_line: 18, last_column: 1,
          },
          {
            filename: "../../shex-cli/test/Imports/TrompPerson/Person.shex",
            importers: [
              "../../shex-cli/test/Imports/TrompPerson/Issue.shex",
              "../../shex-cli/test/Imports/TrompPerson/Employee.shex",
            ],
            first_line: 5, first_column: 0,
            last_line: 10, last_column: 1,
          }
        ].map(fixupFilePaths)
      };

      it("should show locations of reassignments" , async () => {
        const collisionPolicy = makeTestLocationAggregator();
        const {schema, schemaMeta} = await ShExLoader.load(
          // schema
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          // data
          {},
          // schemaOptions
          {
            index: true,
            collisionPolicy
          }
        );
        expect(collisionPolicy.locations).to.deep.equal(expectedDuplicates);
      });

      it("should storeDuplicate" , async () => {
        const collisionPolicy = new StoreDuplicates()
        const {schema, schemaMeta} = await ShExLoader.load(
          // schema
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPerson/Issue.shex")] },
          // data
          {},
          // schemaOptions
          {
            index: true,
            collisionPolicy
          }
        );
        expect(collisionPolicy.duplicates).to.deep.equal(expectedDuplicates);
      });
    });

    describe("reassignment locations with missing shape", function () {
      const expectedDuplicates = {
        "http://a.example/UserShape": [
          {
            filename: "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex",
            importers: [],
            first_line: 8, first_column: 0,
            last_line: 11, last_column: 1,
          },
          {
            filename: "../../shex-cli/test/Imports/TrompPersonMissingRep/User.shex",
            importers: [
              "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex"
            ],
            first_line: 5, first_column: 0,
            last_line: 8, last_column: 1,
          },
        ].map(fixupFilePaths),
        "http://a.example/PersonShape": [
          {
            filename: "../../shex-cli/test/Imports/TrompPersonMissingRep/User.shex",
            importers: [],
            first_line: 10, first_column: 0,
            last_line: 15, last_column: 1,
          },
          {
            filename: "../../shex-cli/test/Imports/TrompPersonMissingRep/Employee.shex",
            importers: [
              "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex",
            ],
            first_line: 13, first_column: 0,
            last_line: 18, last_column: 1,
          },
          {
            filename: "../../shex-cli/test/Imports/TrompPersonMissingRep/Person.shex",
            importers: [
              "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex",
              "../../shex-cli/test/Imports/TrompPersonMissingRep/Employee.shex",
            ],
            first_line: 5, first_column: 0,
            last_line: 10, last_column: 1,
          },
        ].map(fixupFilePaths),
      };

      it("should show locations of reassignments" , async () => {
        const errors = [];
        function missingReferent (error) {
          errors.push(error);
        }
        const collisionPolicy = makeTestLocationAggregator();
        const {schema, schemaMeta} = await ShExLoader.load(
          // schema
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex")] },
          // data
          {},
          // schemaOptions
          {
            index: true,
            collisionPolicy,
            missingReferent,
          }
        );
        const EmployeeShapeCallers = ":\n<http://a.example/UserShape>\n        <http://a.example/IssueShape>\n        <http://a.example/PersonShape>\n        <http://a.example/EmployeeShape>\n        <http://a.example/X>.";
        expect(errors.map(e => [e.message, e.notFoundIn()])).to.deep.equal([
          ["Structural error: reference to http://a.example/RepShape not found in shape declarations", EmployeeShapeCallers],
          ["Structural error: reference to http://a.example/Y not found in shape declarations", EmployeeShapeCallers],
          ["Structural error: reference to http://a.example/Z not found in shape declarations", EmployeeShapeCallers],
        ]);
        expect(collisionPolicy.locations).to.deep.equal(expectedDuplicates);
      });

      it("should storeDuplicate" , async () => {
        const errors = [];
        function missingReferent (error) {
          errors.push(error);
        }
        const collisionPolicy = new StoreDuplicates()
        const {schema, schemaMeta} = await ShExLoader.load(
          // schema
          { shexc: [Path.join(__dirname, "../../shex-cli/test/Imports/TrompPersonMissingRep/Issue.shex")] },
          // data
          {},
          // schemaOptions
          {
            index: true,
            collisionPolicy,
            missingReferent,
          }
        );
        expect(collisionPolicy.duplicates).to.deep.equal(expectedDuplicates);
      });
    });
  });
});
