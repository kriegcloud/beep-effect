"use strict";
/**
 * test @shexjs/loader
 * These tests don't depend on @shexjs/node, which provides file: access.
 * See ../../shex-node/test/Node-test.js for more loader tests.
 */

const VERBOSE = "VERBOSE" in process.env;
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
const {expect, assert} = require("chai");

const Path = require('path');
const N3 = require('n3'); // used for graph API example

const findPath = require('../../shex-validator/test/findPath');
const Path_schemas = findPath("schemas");
const [[SchemaServer, GitRootServer]] = require('../../../tools/testServer')
      .startServer( [
        { url: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/',
          fromDir: Path_schemas },
        { url: 'https://shex.io/webapps/',
          fromDir: Path.join(__dirname, '../../..') }
      ] );

// Initialize @shexjs/loader with implementations of APIs.
const ShExLoader = require("..")({
  rdfjs: N3,                    // use N3 as an RdfJs implementation
  fetch: require('node-fetch'), // fetch implementation
  jsonld: require('jsonld')     // JSON-LD (if you need it)
});

// Schemas from URL, text and ShExJ:
const schemaFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex";

const schemaWithCircularImports =
      "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/start2RefS1-IstartS2"

const schemaWith3CircularImports =
      "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3"

const schemaAsText = {          // ShExC schema and its location
  url: "http://a.example/schemaAsText",
  text: `
<#ShapeFromText> {
  <#p1> @<S1> # reference to Shape loaded from URL
}`
};

const schemaAsShExJ = {
  url: "http://a.example/ShExJ",
  schema: {
    type: "Schema",             // simple schema with single NodeConstraint
    shapes: [
      { "type": "ShapeDecl",
        "id": "http://a.example/S1", // replace schemaFromUrl's S1
        "shapeExpr": {               // with a NodeConstraint
          "type": "NodeConstraint",
          "nodeKind": "iri",
          "pattern": "^https?:" } }
    ] }
};


// Data graphs from URL, text and graph API:
const graphFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl";

const graphAsText = {          // RDF graph and its location
  url: "http://a.example/graphAsText",
  text: `
<#N2> <#p2> "o2" . # reference to Shape loaded from URL`
};

const { namedNode, literal, defaultGraph, quad } = N3.DataFactory;
const graphFromApi = {
  url: "http://a.example/graphFromApi",
  graph: new N3.Store()
}
graphFromApi.graph.add(quad(
  namedNode('http://a.example/graphFromApi#N3'),
  namedNode('http://a.example/p3'),
  literal('o3'),
  defaultGraph(),
));


describe("@shexjs/loader", function () {

  // could break this up into multiple tests
  it("should load schema and data from URLs, text, and pre-loaded structures" , async function () {

    // ShExLoader.load returns a promise to load and merge schema and data.
    function collisionPolicy (type, left, right) {

      expect(type).to.equal('shapeDecl');

      // TODO: fix API to respect order passed to load() and update left/right here.
      expect(left).to.deep.equal({
        "type": "ShapeDecl", "id": "http://a.example/S1",
        "shapeExpr": { "type": "Shape",
          "expression": { "type": "OneOf",
            "expressions": [
              { "type": "TripleConstraint", "predicate": "http://a.example/p1" },
              { "type": "EachOf",
                "expressions": [
                  { "type": "TripleConstraint", "predicate": "http://a.example/p2" },
                  { "type": "TripleConstraint", "predicate": "http://a.example/p3" }
                ] }
            ] } }
      });
      expect(right).to.deep.equal({
        type: 'ShapeDecl',
        id: 'http://a.example/S1',
        shapeExpr: { type: 'NodeConstraint', nodeKind: 'iri', pattern: '^https?:' }
      });
      return true; // override the left assignment with the right (ShapeDecl)
    }

    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ schemaFromUrl, schemaAsText, schemaAsShExJ ] },
      { turtle: [ graphFromUrl, graphAsText, graphFromApi ] },
      { // schemaOptions
        collisionPolicy // take latter value
      }
    );

    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { "mediaType": "text/shex", "url": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", importers: [],
        "base": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", "prefixes": {"": "http://a.example/"} },
      { "mediaType": "text/shex", "url": "http://a.example/schemaAsText", importers: [],
        "base": "http://a.example/schemaAsText", "prefixes": {} },
      { "mediaType": "text/shex", "url": "http://a.example/ShExJ", importers: [],
        "prefixes": {}, "base": "http://a.example/ShExJ" }
    ]);
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type]);
    expect(loadedShapes).to.deep.equal([
      ["http://a.example/S1", "NodeConstraint"],
      ["http://a.example/schemaAsText#ShapeFromText", "Shape"],
    ]);
    expect(dataMeta).to.deep.equal([
      { "mediaType": "text/turtle", "url": "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl", importers: [],
        "base": "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl", "prefixes": { "": "http://a.example/" } },
      { "mediaType": "text/turtle", "url": "http://a.example/graphAsText", importers: [],
        "base": "http://a.example/graphAsText", "prefixes": {} },
      { "mediaType": "text/turtle", "url": "http://a.example/graphFromApi", importers: [],
        "base": "http://a.example/graphFromApi", "prefixes": {} }
    ]);
    const quads = data.getQuads().sort((l, r) => l.subject.value.localeCompare(r.subject.value));
    const quadStrs = quads.map(q => (['subject', 'predicate', 'object']).map(t => q[t].value));
    expect(quadStrs).to.deep.equal([
      ["http://a.example/graphAsText#N2", "http://a.example/graphAsText#p2", "o2"],
      ["http://a.example/graphFromApi#N3", "http://a.example/p3", "o3"],
      ["https://shex.io/webapps/packages/shex-cli/test/cli/x", "http://a.example/p1", "p1-0"]
    ]);
  });

  it("should handle circular imports" , async function () {
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ schemaWithCircularImports + ".shex" ] },
      null,
      { iriTransform: i => i + '.shex' }
    );
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { mediaType: 'text/shex',
        url: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/start2RefS1-IstartS2.shex',
        importers: [],
        base: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/start2RefS1-IstartS2.shex',
        prefixes: {}
      }
    ])
    expect(schema).to.deep.equal({
  "type": "Schema",
  "imports": [
    "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/start2RefS2"
  ],
  "start": "http://a.example/S1",
  "shapes": [
    {
      "id": "http://a.example/S1",
      "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p1",
          "valueExpr": "http://a.example/S2"
        }
      }
    },
    {
      "id": "http://a.example/S2",
      "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p2"
        }
      }
    }
  ]})
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type]);
    expect(loadedShapes).to.deep.equal([
      [ 'http://a.example/S1', 'Shape' ],
      [ 'http://a.example/S2', 'Shape' ]
    ]);
  });

  it("should handle (circular) imports when loaded from text" , async function () {
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ { url: schemaWith3CircularImports, text: `IMPORT <3circRefS2-IS3>
IMPORT <3circRefS3>
<http://a.example/S1> {
   <http://a.example/p1> .;
   <http://a.example/p2> @<http://a.example/S2>?
}
`
 } ] },
      null,
      { iriTransform: i => i + '.shex' }
    );
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { mediaType: 'text/shex',
        url: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3',
        importers: [],
        base: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3',
        prefixes: {}
      }
    ])
    expect(schema).to.deep.equal( {
  "type": "Schema",
  "imports": [
    "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS3",
    "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS2-IS3",
  ],
  "shapes": [
    { "id": "http://a.example/S2", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p3",
          "valueExpr": "http://a.example/S3" } } },
    { "id": "http://a.example/S3", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p4",
          "valueExpr": "http://a.example/S1" } } },
    { "id": "http://a.example/S1", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "EachOf",
          "expressions": [
            {
              "type": "TripleConstraint",
              "predicate": "http://a.example/p1"
            },
            {
              "type": "TripleConstraint",
              "predicate": "http://a.example/p2", "min": 0, "max": 1,
              "valueExpr": "http://a.example/S2" }
          ]
        } } }
  ]})
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type]);
    expect(loadedShapes).to.deep.equal([
      [ 'http://a.example/S2', 'Shape' ],
      [ 'http://a.example/S3', 'Shape' ],
      [ 'http://a.example/S1', 'Shape' ]
    ]);
  });

  it("should handle (circular) imports when loaded from shexJ" , async function () {
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      {
        shexc: [
          { url: schemaWith3CircularImports, schema: {
            "@context": "http://www.w3.org/ns/shex.jsonld", "type": "Schema",
            "imports": [ new URL("3circRefS2-IS3", schemaWith3CircularImports).href,
                         new URL("3circRefS3", schemaWith3CircularImports).href ],
            "shapes": [
              { "type": "ShapeDecl", "id": "http://a.example/S1", "shapeExpr": {
                type: "Shape",
                "expression": {
                  "type": "EachOf", "expressions": [
                    { "type": "TripleConstraint", "predicate": "http://a.example/p1" },
                    { "type": "TripleConstraint", "predicate": "http://a.example/p2",
                      "min": 0, "max": 1, "valueExpr": "http://a.example/S2" }
                  ] } } }
            ] } }
        ] },
      null,
      { iriTransform: i => i + '.shex' }
    );
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { mediaType: 'text/shex',
        url: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3',
        importers: [],
        base: 'https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3',
        prefixes: {}
      }
    ])
    expect(schema).to.deep.equal( {
  "type": "Schema",
  "imports": [
    "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS3",
    "https://raw.githubusercontent.com/shexSpec/shexTest/main/schemas/3circRefS2-IS3",
  ],
  "shapes": [
    { "id": "http://a.example/S2", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p3",
          "valueExpr": "http://a.example/S3" } } },
    { "id": "http://a.example/S3", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/p4",
          "valueExpr": "http://a.example/S1" } } },
    { "id": "http://a.example/S1", "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "EachOf",
          "expressions": [
            {
              "type": "TripleConstraint",
              "predicate": "http://a.example/p1"
            },
            {
              "type": "TripleConstraint",
              "predicate": "http://a.example/p2", "min": 0, "max": 1,
              "valueExpr": "http://a.example/S2" }
          ]
        } } }
  ]})
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type]);
    expect(loadedShapes).to.deep.equal([
      [ 'http://a.example/S2', 'Shape' ],
      [ 'http://a.example/S3', 'Shape' ],
      [ 'http://a.example/S1', 'Shape' ]
    ]);
  });

  it("should work with one parameter" , async function () {
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ schemaFromUrl ] }
    );
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { "mediaType": "text/shex", "url": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", importers: [],
        "base": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", "prefixes": {"": "http://a.example/"} }
    ])
    expect(schema).to.deep.equal({
      "type": "Schema", "start": "http://a.example/S1", "shapes": [
        { "id": "http://a.example/S1", "type": "ShapeDecl", "shapeExpr": {
          "type": "Shape", "expression": {
            "type": "OneOf", "expressions":[
              {"type":"TripleConstraint","predicate":"http://a.example/p1"},
              {"type":"EachOf","expressions":[
                {"type":"TripleConstraint","predicate":"http://a.example/p2"},
                {"type":"TripleConstraint","predicate":"http://a.example/p3"}
              ]}
            ] } } }
      ] } )
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type]);
    expect(loadedShapes).to.deep.equal([
      [ 'http://a.example/S1', 'Shape' ],
    ]);
  });

  it("should throw on collisions under default schema options" , async function () {
    try {
      await ShExLoader.load( { shexc: [ schemaFromUrl, schemaFromUrl ] } );
      assert.isOk(false, 'call to load should have rejected')
    } catch (e) {
      expect(e).to.match(/ collides with /)
    }
  });
});
