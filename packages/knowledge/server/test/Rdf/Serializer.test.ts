/**
 * Serializer Service Tests
 *
 * Comprehensive tests for RDF parsing and serialization operations.
 *
 * @module knowledge-server/test/Rdf/Serializer.test
 * @since 0.1.0
 */
import { SerializerError } from "@beep/knowledge-domain/errors";
import { Literal, makeIRI, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { Serializer } from "@beep/knowledge-server/Rdf/Serializer";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";

/**
 * Helper for string includes check with correct argument order
 * Str.includes is curried: Str.includes(searchString)(str) -> boolean
 */
const includes = (str: string, search: string): boolean => Str.includes(search)(str);

/**
 * Test layer combining Serializer with its RdfStore dependency
 * We must use Layer.provideMerge so that:
 * 1. RdfStore.Default is provided to Serializer.Default
 * 2. The SAME RdfStore instance is exposed for direct test access
 */
const TestLayer = Layer.provideMerge(Serializer.Default, RdfStore.Default);

/**
 * Common RDF namespace prefixes for test fixtures
 */
const EX = "http://example.org/";
const FOAF = "http://xmlns.com/foaf/0.1/";

/**
 * Test fixture helpers
 */
const fixtures = {
  alice: makeIRI(`${EX}alice`),
  bob: makeIRI(`${EX}bob`),
  carol: makeIRI(`${EX}carol`),
  foafName: makeIRI(`${FOAF}name`),
  foafKnows: makeIRI(`${FOAF}knows`),
  graph1: makeIRI(`${EX}graph1`),
  graph2: makeIRI(`${EX}graph2`),
};

/**
 * Sample Turtle content for tests
 */
const SIMPLE_TURTLE = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice" .
`;

const MULTI_TRIPLE_TURTLE = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice" .
ex:alice foaf:knows ex:bob .
ex:bob foaf:name "Bob" .
`;

const INVALID_TURTLE = `
@prefix ex: <http://example.org/> .
ex:alice foaf:name "Alice
`;

describe("Serializer", () => {
  describe("parseTurtle", () => {
    effect("should parse simple Turtle with one triple and verify count = 1", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const count = yield* serializer.parseTurtle(SIMPLE_TURTLE);

        strictEqual(count, 1);

        const size = yield* store.size;
        strictEqual(size, 1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should parse Turtle with prefixes and verify quads loaded correctly", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* serializer.parseTurtle(SIMPLE_TURTLE);

        const pattern = new QuadPattern({ subject: fixtures.alice });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 1);
        strictEqual(results[0]?.subject, fixtures.alice);
        strictEqual(results[0]?.predicate, fixtures.foafName);
        assertTrue(results[0]?.object instanceof Literal);
        strictEqual((results[0]?.object as Literal).value, "Alice");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should parse Turtle with multiple triples and verify count", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const count = yield* serializer.parseTurtle(MULTI_TRIPLE_TURTLE);

        strictEqual(count, 3);

        const size = yield* store.size;
        strictEqual(size, 3);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should parse Turtle into named graph and verify graph field set", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* serializer.parseTurtle(SIMPLE_TURTLE, fixtures.graph1);

        const quads = yield* store.getQuads();

        strictEqual(quads.length, 1);
        strictEqual(quads[0]?.graph, fixtures.graph1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return SerializerError for invalid Turtle", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const result = yield* Effect.flip(serializer.parseTurtle(INVALID_TURTLE));

        assertTrue(result instanceof SerializerError);
        strictEqual(result.operation, "parseTurtle");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle empty Turtle content", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const count = yield* serializer.parseTurtle("");

        strictEqual(count, 0);

        const size = yield* store.size;
        strictEqual(size, 0);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle Turtle with only prefixes (no triples)", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithOnlyPrefixes = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
`;

        const count = yield* serializer.parseTurtle(turtleWithOnlyPrefixes);

        strictEqual(count, 0);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("parseOnly", () => {
    effect("should parse and return quads without modifying store", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const quads = yield* serializer.parseOnly(SIMPLE_TURTLE);

        strictEqual(quads.length, 1);

        const storeSize = yield* store.size;
        strictEqual(storeSize, 0);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should parse into specific graph and set graph on returned quads", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = yield* serializer.parseOnly(SIMPLE_TURTLE, fixtures.graph1);

        strictEqual(quads.length, 1);
        strictEqual(quads[0]?.graph, fixtures.graph1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return correct quad structure from parsed Turtle", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = yield* serializer.parseOnly(SIMPLE_TURTLE);

        strictEqual(quads.length, 1);
        const quad = quads[0];
        strictEqual(quad?.subject, fixtures.alice);
        strictEqual(quad?.predicate, fixtures.foafName);
        assertTrue(quad?.object instanceof Literal);
        strictEqual((quad?.object as Literal).value, "Alice");
        strictEqual(quad?.graph, undefined);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should parse multiple triples without modifying store", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const quads = yield* serializer.parseOnly(MULTI_TRIPLE_TURTLE);

        strictEqual(quads.length, 3);

        const storeSize = yield* store.size;
        strictEqual(storeSize, 0);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return SerializerError for invalid Turtle", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const result = yield* Effect.flip(serializer.parseOnly(INVALID_TURTLE));

        assertTrue(result instanceof SerializerError);
        strictEqual(result.operation, "parseTurtle");
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("serialize", () => {
    effect("should serialize quads from store to Turtle format", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        const turtle = yield* serializer.serialize("Turtle");

        assertTrue(includes(turtle, "http://example.org/alice"));
        assertTrue(includes(turtle, "http://xmlns.com/foaf/0.1/name"));
        assertTrue(includes(turtle, "Alice"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize to N-Triples format", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        const ntriples = yield* serializer.serialize("NTriples");

        assertTrue(includes(ntriples, "<http://example.org/alice>"));
        assertTrue(includes(ntriples, "<http://xmlns.com/foaf/0.1/name>"));
        assertTrue(includes(ntriples, '"Alice"'));
        assertTrue(includes(ntriples, " ."));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize specific graph only", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
            graph: fixtures.graph1,
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
            graph: fixtures.graph2,
          }),
        ]);

        const turtle = yield* serializer.serialize("Turtle", fixtures.graph1);

        assertTrue(includes(turtle, "Alice"));
        assertTrue(!includes(turtle, "Bob"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return SerializerError for JSON-LD format", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const result = yield* Effect.flip(serializer.serialize("JSONLD"));

        assertTrue(result instanceof SerializerError);
        strictEqual(result.operation, "serialize");
        assertTrue(includes(result.message, "JSON-LD"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize empty store to empty string", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtle = yield* serializer.serialize("Turtle");

        strictEqual(Str.trim(turtle), "");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize multiple quads to Turtle", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
        ]);

        const turtle = yield* serializer.serialize("Turtle");

        assertTrue(includes(turtle, "Alice"));
        assertTrue(includes(turtle, "http://example.org/bob"));
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("serializeQuads", () => {
    effect("should serialize provided quads to Turtle", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
        ];

        const turtle = yield* serializer.serializeQuads(quads, "Turtle");

        assertTrue(includes(turtle, "http://example.org/alice"));
        assertTrue(includes(turtle, "Alice"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize provided quads to N-Triples", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
        ];

        const ntriples = yield* serializer.serializeQuads(quads, "NTriples");

        assertTrue(includes(ntriples, "<http://example.org/alice>"));
        assertTrue(includes(ntriples, '"Alice"'));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return SerializerError for JSON-LD format", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
        ];

        const result = yield* Effect.flip(serializer.serializeQuads(quads, "JSONLD"));

        assertTrue(result instanceof SerializerError);
        strictEqual(result.operation, "serializeQuads");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize empty quad array to empty string", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtle = yield* serializer.serializeQuads([], "Turtle");

        strictEqual(Str.trim(turtle), "");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should not modify store when serializing quads directly", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
        ];

        yield* serializer.serializeQuads(quads, "Turtle");

        const storeSize = yield* store.size;
        strictEqual(storeSize, 0);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("Round-Trip Tests", () => {
    effect("should preserve data: parseTurtle -> serialize -> parseOnly -> compare", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* serializer.parseTurtle(MULTI_TRIPLE_TURTLE);

        const serialized = yield* serializer.serialize("Turtle");

        yield* store.clear();

        const reparsedQuads = yield* serializer.parseOnly(serialized);

        strictEqual(reparsedQuads.length, 3);

        const hasAliceName = A.some(
          reparsedQuads,
          (q) => q.subject === fixtures.alice && q.predicate === fixtures.foafName
        );
        assertTrue(hasAliceName);

        const hasAliceKnowsBob = A.some(
          reparsedQuads,
          (q) => q.subject === fixtures.alice && q.predicate === fixtures.foafKnows && q.object === fixtures.bob
        );
        assertTrue(hasAliceKnowsBob);

        const hasBobName = A.some(
          reparsedQuads,
          (q) => q.subject === fixtures.bob && q.predicate === fixtures.foafName
        );
        assertTrue(hasBobName);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should preserve data through N-Triples round-trip", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const originalQuads = yield* serializer.parseOnly(SIMPLE_TURTLE);

        const ntriples = yield* serializer.serializeQuads(originalQuads, "NTriples");

        const reparsedQuads = yield* serializer.parseOnly(ntriples);

        strictEqual(reparsedQuads.length, 1);
        strictEqual(reparsedQuads[0]?.subject, originalQuads[0]?.subject);
        strictEqual(reparsedQuads[0]?.predicate, originalQuads[0]?.predicate);

        assertTrue(reparsedQuads[0]?.object instanceof Literal);
        assertTrue(originalQuads[0]?.object instanceof Literal);
        strictEqual((reparsedQuads[0]?.object as Literal).value, (originalQuads[0]?.object as Literal).value);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should preserve literal with language tag through round-trip", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithLang = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice"@en .
`;

        const quads = yield* serializer.parseOnly(turtleWithLang);
        strictEqual(quads.length, 1);
        assertTrue(quads[0]?.object instanceof Literal);
        strictEqual((quads[0]?.object as Literal).language, "en");

        const serialized = yield* serializer.serializeQuads(quads, "Turtle");
        const reparsed = yield* serializer.parseOnly(serialized);

        strictEqual(reparsed.length, 1);
        assertTrue(reparsed[0]?.object instanceof Literal);
        strictEqual((reparsed[0]?.object as Literal).value, "Alice");
        strictEqual((reparsed[0]?.object as Literal).language, "en");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should preserve typed literal through round-trip", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithTypedLiteral = `
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:alice ex:age "30"^^xsd:integer .
`;

        const quads = yield* serializer.parseOnly(turtleWithTypedLiteral);
        strictEqual(quads.length, 1);
        assertTrue(quads[0]?.object instanceof Literal);
        strictEqual((quads[0]?.object as Literal).value, "30");
        strictEqual((quads[0]?.object as Literal).datatype, makeIRI("http://www.w3.org/2001/XMLSchema#integer"));

        const serialized = yield* serializer.serializeQuads(quads, "NTriples");
        const reparsed = yield* serializer.parseOnly(serialized);

        strictEqual(reparsed.length, 1);
        assertTrue(reparsed[0]?.object instanceof Literal);
        strictEqual((reparsed[0]?.object as Literal).value, "30");
        strictEqual((reparsed[0]?.object as Literal).datatype, makeIRI("http://www.w3.org/2001/XMLSchema#integer"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should preserve IRI object through round-trip", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithIriObject = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:knows ex:bob .
`;

        const quads = yield* serializer.parseOnly(turtleWithIriObject);
        strictEqual(quads.length, 1);
        strictEqual(quads[0]?.object, fixtures.bob);

        const serialized = yield* serializer.serializeQuads(quads, "Turtle");
        const reparsed = yield* serializer.parseOnly(serialized);

        strictEqual(reparsed.length, 1);
        strictEqual(reparsed[0]?.object, fixtures.bob);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("Named Graph Integration", () => {
    effect("should parse into separate graphs and serialize only one", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const turtleA = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice" .
`;

        const turtleB = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:bob foaf:name "Bob" .
`;

        yield* serializer.parseTurtle(turtleA, fixtures.graph1);
        yield* serializer.parseTurtle(turtleB, fixtures.graph2);

        const storeSize = yield* store.size;
        strictEqual(storeSize, 2);

        const serializedGraphA = yield* serializer.serialize("Turtle", fixtures.graph1);

        assertTrue(includes(serializedGraphA, "Alice"));
        assertTrue(!includes(serializedGraphA, "Bob"));

        const serializedGraphB = yield* serializer.serialize("Turtle", fixtures.graph2);

        assertTrue(includes(serializedGraphB, "Bob"));
        assertTrue(!includes(serializedGraphB, "Alice"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should serialize all graphs when no graph filter specified", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
            graph: fixtures.graph1,
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
            graph: fixtures.graph2,
          }),
          new Quad({
            subject: fixtures.carol,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Carol" }),
          }),
        ]);

        const serialized = yield* serializer.serialize("Turtle");

        assertTrue(includes(serialized, "Alice"));
        assertTrue(includes(serialized, "Bob"));
        assertTrue(includes(serialized, "Carol"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should preserve graph through parseOnly with graph parameter", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const quads = yield* serializer.parseOnly(SIMPLE_TURTLE, fixtures.graph1);

        strictEqual(quads.length, 1);
        strictEqual(quads[0]?.graph, fixtures.graph1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle mixed default and named graph quads", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice Default" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice Graph1" }),
            graph: fixtures.graph1,
          }),
        ]);

        // Note: graph: undefined in QuadPattern is a wildcard (matches ALL graphs)
        // To match default graph only, you would need to explicitly filter
        const allQuads = yield* store.getQuads();
        strictEqual(allQuads.length, 2);

        const graph1Turtle = yield* serializer.serialize("Turtle", fixtures.graph1);
        assertTrue(includes(graph1Turtle, "Alice Graph1"));
        assertTrue(!includes(graph1Turtle, "Alice Default"));
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("Edge Cases", () => {
    effect("should handle Turtle with blank nodes", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithBnode = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:knows [ foaf:name "Anonymous" ] .
`;

        const quads = yield* serializer.parseOnly(turtleWithBnode);

        assertTrue(quads.length >= 2);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle Turtle with special characters in literals", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithSpecialChars = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice \\"the Great\\"" .
`;

        const quads = yield* serializer.parseOnly(turtleWithSpecialChars);

        strictEqual(quads.length, 1);
        assertTrue(quads[0]?.object instanceof Literal);
        assertTrue(includes((quads[0]?.object as Literal).value, "the Great"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle Turtle with multiline literals", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithMultiline = `
@prefix ex: <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:alice rdfs:comment """This is a
multiline
comment.""" .
`;

        const quads = yield* serializer.parseOnly(turtleWithMultiline);

        strictEqual(quads.length, 1);
        assertTrue(quads[0]?.object instanceof Literal);
        assertTrue(includes((quads[0]?.object as Literal).value, "multiline"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle Turtle with numeric datatypes", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithNumbers = `
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:alice ex:age 30 .
ex:alice ex:height 1.75 .
`;

        const quads = yield* serializer.parseOnly(turtleWithNumbers);

        strictEqual(quads.length, 2);

        const ageQuad = A.findFirst(quads, (q) => includes(q.predicate, "age"));
        assertTrue(ageQuad._tag === "Some");
        assertTrue(ageQuad.value.object instanceof Literal);
        strictEqual(ageQuad.value.object.value, "30");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle Turtle with boolean literals", () =>
      Effect.gen(function* () {
        const serializer = yield* Serializer;

        const turtleWithBool = `
@prefix ex: <http://example.org/> .

ex:alice ex:active true .
ex:bob ex:active false .
`;

        const quads = yield* serializer.parseOnly(turtleWithBool);

        strictEqual(quads.length, 2);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("Store Isolation", () => {
    effect("should provide fresh store instance per test layer", () =>
      Effect.gen(function* () {
        const result1 = yield* Effect.gen(function* () {
          const serializer = yield* Serializer;
          const store = yield* RdfStore;
          yield* serializer.parseTurtle(SIMPLE_TURTLE);
          return yield* store.size;
        }).pipe(Effect.provide(TestLayer));

        const result2 = yield* Effect.gen(function* () {
          const store = yield* RdfStore;
          return yield* store.size;
        }).pipe(Effect.provide(TestLayer));

        strictEqual(result1, 1);
        strictEqual(result2, 0);
      })
    );
  });
});
