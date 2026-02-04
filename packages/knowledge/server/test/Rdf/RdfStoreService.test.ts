/**
 * RdfStoreService Tests
 *
 * Comprehensive tests for the in-memory RDF quad storage service.
 *
 * @module knowledge-server/test/Rdf/RdfStoreService.test
 * @since 0.1.0
 */
import { Literal, makeBlankNode, makeIRI, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

/**
 * Common RDF namespace prefixes for test fixtures
 */
const FOAF = "http://xmlns.com/foaf/0.1/";
const SCHEMA = "http://schema.org/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const EX = "http://example.org/";

/**
 * Test fixture helpers
 */
const fixtures = {
  alice: makeIRI(`${EX}alice`),
  bob: makeIRI(`${EX}bob`),
  carol: makeIRI(`${EX}carol`),
  foafName: makeIRI(`${FOAF}name`),
  foafKnows: makeIRI(`${FOAF}knows`),
  foafAge: makeIRI(`${FOAF}age`),
  schemaName: makeIRI(`${SCHEMA}name`),
  schemaWorksFor: makeIRI(`${SCHEMA}worksFor`),
  acmeCorp: makeIRI(`${EX}acme-corp`),
  graph1: makeIRI(`${EX}graph1`),
  graph2: makeIRI(`${EX}graph2`),
  xsdInteger: makeIRI(`${XSD}integer`),
  blankB1: makeBlankNode("_:b1"),
  blankB2: makeBlankNode("_:b2"),
};

describe("RdfStore", () => {
  describe("Basic CRUD Operations", () => {
    effect("addQuad and hasQuad - should add a quad and verify it exists", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });

        yield* store.addQuad(quad);
        const exists = yield* store.hasQuad(quad);

        assertTrue(exists);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("hasQuad - should return false for non-existent quad", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });

        const exists = yield* store.hasQuad(quad);

        assertTrue(!exists);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("removeQuad - should add then remove and verify it is gone", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });

        yield* store.addQuad(quad);
        const existsAfterAdd = yield* store.hasQuad(quad);
        assertTrue(existsAfterAdd);

        yield* store.removeQuad(quad);
        const existsAfterRemove = yield* store.hasQuad(quad);
        assertTrue(!existsAfterRemove);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("addQuads - should add multiple quads in bulk", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
          new Quad({
            subject: fixtures.carol,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Carol" }),
          }),
        ];

        yield* store.addQuads(quads);
        const size = yield* store.size;

        strictEqual(size, 3);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("removeQuads - should remove multiple quads in bulk", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
        ];

        yield* store.addQuads(quads);
        const sizeAfterAdd = yield* store.size;
        strictEqual(sizeAfterAdd, 2);

        yield* store.removeQuads(quads);
        const sizeAfterRemove = yield* store.size;
        strictEqual(sizeAfterRemove, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("size - should return correct quad count", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const initialSize = yield* store.size;
        strictEqual(initialSize, 0);

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        const sizeAfterOne = yield* store.size;
        strictEqual(sizeAfterOne, 1);

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          })
        );

        const sizeAfterTwo = yield* store.size;
        strictEqual(sizeAfterTwo, 2);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("clear - should empty the store", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
        ]);

        const sizeBeforeClear = yield* store.size;
        strictEqual(sizeBeforeClear, 2);

        yield* store.clear();

        const sizeAfterClear = yield* store.size;
        strictEqual(sizeAfterClear, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("getQuads - should return all quads in the store", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quads = [
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
        ];

        yield* store.addQuads(quads);
        const allQuads = yield* store.getQuads();

        strictEqual(allQuads.length, 2);
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Pattern Matching", () => {
    effect("match with all wildcards - should return all quads", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
        ]);

        const pattern = new QuadPattern({});
        const results = yield* store.match(pattern);

        strictEqual(results.length, 3);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("match with subject constraint - should return quads for that subject", () =>
      Effect.gen(function* () {
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
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
        ]);

        const pattern = new QuadPattern({ subject: fixtures.alice });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 2);
        for (const quad of results) {
          strictEqual(quad.subject, fixtures.alice);
        }
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("match with predicate constraint - should return quads with that predicate", () =>
      Effect.gen(function* () {
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
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
        ]);

        const pattern = new QuadPattern({ predicate: fixtures.foafName });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 2);
        for (const quad of results) {
          strictEqual(quad.predicate, fixtures.foafName);
        }
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("match with object constraint - should return quads with that object", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
          new Quad({
            subject: fixtures.carol,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafKnows,
            object: fixtures.alice,
          }),
        ]);

        const pattern = new QuadPattern({ object: fixtures.bob });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 2);
        for (const quad of results) {
          strictEqual(quad.object, fixtures.bob);
        }
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("match with multiple constraints - should return matching quads", () =>
      Effect.gen(function* () {
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
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafKnows,
            object: fixtures.alice,
          }),
        ]);

        const pattern = new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
        });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 1);
        strictEqual(results[0]?.subject, fixtures.alice);
        strictEqual(results[0]?.predicate, fixtures.foafKnows);
        strictEqual(results[0]?.object, fixtures.bob);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("countMatches - should return correct count", () =>
      Effect.gen(function* () {
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
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
        ]);

        const allCount = yield* store.countMatches(new QuadPattern({}));
        strictEqual(allCount, 3);

        const aliceCount = yield* store.countMatches(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(aliceCount, 2);

        const nameCount = yield* store.countMatches(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(nameCount, 2);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("match with no results - should return empty array", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        const pattern = new QuadPattern({ subject: fixtures.bob });
        const results = yield* store.match(pattern);

        strictEqual(results.length, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Term Types", () => {
    effect("Quad with IRI object - should store and retrieve IRI object", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
          object: fixtures.bob,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        strictEqual(results[0]?.object, fixtures.bob);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad with BlankNode subject - should store and retrieve blank node", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.blankB1,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Anonymous" }),
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        strictEqual(results[0]?.subject, fixtures.blankB1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad with BlankNode object - should store and retrieve blank node in object position", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
          object: fixtures.blankB1,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        strictEqual(results[0]?.object, fixtures.blankB1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad with plain Literal - should store and retrieve plain literal", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const literal = new Literal({ value: "Alice Smith" });
        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: literal,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        const resultObject = results[0]?.object;
        assertTrue(resultObject instanceof Literal);
        strictEqual(resultObject.value, "Alice Smith");
        strictEqual(resultObject.language, undefined);
        strictEqual(resultObject.datatype, undefined);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad with language-tagged Literal - should preserve language tag", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const literal = new Literal({ value: "Alice", language: "en" });
        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: literal,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        const resultObject = results[0]?.object;
        assertTrue(resultObject instanceof Literal);
        strictEqual(resultObject.value, "Alice");
        strictEqual(resultObject.language, "en");
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad with typed Literal - should preserve datatype IRI", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const literal = new Literal({ value: "42", datatype: fixtures.xsdInteger });
        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafAge,
          object: literal,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        const resultObject = results[0]?.object;
        assertTrue(resultObject instanceof Literal);
        strictEqual(resultObject.value, "42");
        strictEqual(resultObject.datatype, fixtures.xsdInteger);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Multiple literals with different languages - should distinguish them", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice", language: "en" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alicia", language: "es" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice", language: "fr" }),
          }),
        ]);

        const size = yield* store.size;
        strictEqual(size, 3);

        const results = yield* store.match(new QuadPattern({ subject: fixtures.alice, predicate: fixtures.foafName }));
        strictEqual(results.length, 3);
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Named Graphs", () => {
    effect("Quad with named graph - should store and retrieve graph", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
          graph: fixtures.graph1,
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        strictEqual(results[0]?.graph, fixtures.graph1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Quad in default graph - should have undefined graph", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });

        yield* store.addQuad(quad);
        const results = yield* store.getQuads();

        strictEqual(results.length, 1);
        strictEqual(results[0]?.graph, undefined);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Pattern matching on specific graph - should filter by graph", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
            graph: fixtures.graph1,
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice (Corp)" }),
            graph: fixtures.graph2,
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice Default" }),
          }),
        ]);

        const graph1Results = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
        strictEqual(graph1Results.length, 1);
        strictEqual(graph1Results[0]?.graph, fixtures.graph1);

        const graph2Results = yield* store.match(new QuadPattern({ graph: fixtures.graph2 }));
        strictEqual(graph2Results.length, 1);
        strictEqual(graph2Results[0]?.graph, fixtures.graph2);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("getGraphs - should return unique graphs including default", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
            graph: fixtures.graph1,
          }),
          new Quad({
            subject: fixtures.carol,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Carol" }),
            graph: fixtures.graph1,
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.schemaWorksFor,
            object: fixtures.acmeCorp,
            graph: fixtures.graph2,
          }),
        ]);

        const graphs = yield* store.getGraphs();

        strictEqual(graphs.length, 3);
        assertTrue(A.some(graphs, (g) => g === undefined));
        assertTrue(A.some(graphs, (g) => g === fixtures.graph1));
        assertTrue(A.some(graphs, (g) => g === fixtures.graph2));
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Unique Term Accessors", () => {
    effect("getSubjects - should return unique subjects", () =>
      Effect.gen(function* () {
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
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
          new Quad({
            subject: fixtures.blankB1,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Anonymous" }),
          }),
        ]);

        const subjects = yield* store.getSubjects();

        strictEqual(subjects.length, 3);
        assertTrue(A.some(subjects, (s) => s === fixtures.alice));
        assertTrue(A.some(subjects, (s) => s === fixtures.bob));
        assertTrue(A.some(subjects, (s) => s === fixtures.blankB1));
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("getPredicates - should return unique predicates", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Bob" }),
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.schemaWorksFor,
            object: fixtures.acmeCorp,
          }),
        ]);

        const predicates = yield* store.getPredicates();

        strictEqual(predicates.length, 3);
        assertTrue(A.some(predicates, (p) => p === fixtures.foafName));
        assertTrue(A.some(predicates, (p) => p === fixtures.foafKnows));
        assertTrue(A.some(predicates, (p) => p === fixtures.schemaWorksFor));
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("getObjects - should return unique objects", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const aliceLiteral = new Literal({ value: "Alice" });
        const bobLiteral = new Literal({ value: "Bob" });

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: aliceLiteral,
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: bobLiteral,
          }),
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
          new Quad({
            subject: fixtures.carol,
            predicate: fixtures.foafKnows,
            object: fixtures.bob,
          }),
        ]);

        const objects = yield* store.getObjects();

        strictEqual(objects.length, 3);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("getSubjects with blank nodes - should include blank nodes", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([
          new Quad({
            subject: fixtures.blankB1,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Person 1" }),
          }),
          new Quad({
            subject: fixtures.blankB2,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Person 2" }),
          }),
        ]);

        const subjects = yield* store.getSubjects();

        strictEqual(subjects.length, 2);
        assertTrue(A.some(subjects, (s) => s === fixtures.blankB1));
        assertTrue(A.some(subjects, (s) => s === fixtures.blankB2));
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Edge Cases", () => {
    effect("Empty store - should return empty results", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const size = yield* store.size;
        strictEqual(size, 0);

        const quads = yield* store.getQuads();
        strictEqual(quads.length, 0);

        const subjects = yield* store.getSubjects();
        strictEqual(subjects.length, 0);

        const predicates = yield* store.getPredicates();
        strictEqual(predicates.length, 0);

        const objects = yield* store.getObjects();
        strictEqual(objects.length, 0);

        const graphs = yield* store.getGraphs();
        strictEqual(graphs.length, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Duplicate quad - should not increase size", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const quad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });

        yield* store.addQuad(quad);
        const sizeAfterFirst = yield* store.size;
        strictEqual(sizeAfterFirst, 1);

        yield* store.addQuad(quad);
        const sizeAfterSecond = yield* store.size;
        strictEqual(sizeAfterSecond, 1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Remove non-existent quad - should be no-op", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        const nonExistent = new Quad({
          subject: fixtures.bob,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Bob" }),
        });

        yield* store.removeQuad(nonExistent);

        const size = yield* store.size;
        strictEqual(size, 1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Clear empty store - should be no-op", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.clear();

        const size = yield* store.size;
        strictEqual(size, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("addQuads with empty array - should be no-op", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuads([]);

        const size = yield* store.size;
        strictEqual(size, 0);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("removeQuads with empty array - should be no-op", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice" }),
          })
        );

        yield* store.removeQuads([]);

        const size = yield* store.size;
        strictEqual(size, 1);
      }).pipe(Effect.provide(RdfStore.Default))
    );

    effect("Pattern matching with Literal object constraint - should match exactly", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;

        const aliceLiteral = new Literal({ value: "Alice" });
        const aliceLiteralEn = new Literal({ value: "Alice", language: "en" });

        yield* store.addQuads([
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: aliceLiteral,
          }),
          new Quad({
            subject: fixtures.bob,
            predicate: fixtures.foafName,
            object: aliceLiteralEn,
          }),
        ]);

        const plainResults = yield* store.match(new QuadPattern({ object: aliceLiteral }));
        strictEqual(plainResults.length, 1);
        strictEqual(plainResults[0]?.subject, fixtures.alice);

        const langResults = yield* store.match(new QuadPattern({ object: aliceLiteralEn }));
        strictEqual(langResults.length, 1);
        strictEqual(langResults[0]?.subject, fixtures.bob);
      }).pipe(Effect.provide(RdfStore.Default))
    );
  });

  describe("Store Isolation", () => {
    effect("Each RdfStore.Default provides fresh instance", () =>
      Effect.gen(function* () {
        const store1 = yield* Effect.gen(function* () {
          const store = yield* RdfStore;
          yield* store.addQuad(
            new Quad({
              subject: fixtures.alice,
              predicate: fixtures.foafName,
              object: new Literal({ value: "Alice" }),
            })
          );
          return yield* store.size;
        }).pipe(Effect.provide(RdfStore.Default));

        const store2 = yield* Effect.gen(function* () {
          const store = yield* RdfStore;
          return yield* store.size;
        }).pipe(Effect.provide(RdfStore.Default));

        strictEqual(store1, 1);
        strictEqual(store2, 0);
      })
    );
  });
});
