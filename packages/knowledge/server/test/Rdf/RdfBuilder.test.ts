/**
 * RdfBuilder Tests
 *
 * Tests for the fluent RDF quad builder service.
 *
 * @module knowledge-server/test/Rdf/RdfBuilder.test
 * @since 0.1.0
 */
import { Literal, makeBlankNode, makeIRI, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfBuilder } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { layer, strictEqual, assertTrue } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

/**
 * Common RDF namespace prefixes for test fixtures
 */
const FOAF = "http://xmlns.com/foaf/0.1/";
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
  graph1: makeIRI(`${EX}graph1`),
  graph2: makeIRI(`${EX}graph2`),
  xsdInteger: makeIRI(`${XSD}integer`),
  xsdDate: makeIRI(`${XSD}date`),
  blankB1: makeBlankNode("_:b1"),
};

/**
 * Test Layer combining RdfStore and RdfBuilder
 * RdfBuilder.Default depends on RdfStore, so we provide RdfStore to it
 */
const TestLayer = RdfBuilder.Default.pipe(Layer.provideMerge(RdfStore.Default));

layer(TestLayer, { timeout: Duration.seconds(30) })("RdfBuilder", (it) => {
  it.effect(
    "subject().predicate().literal() - should build and add a plain string literal quad",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      assertTrue(quad.object instanceof Literal);
      strictEqual((quad.object as Literal).value, "Alice");
      strictEqual((quad.object as Literal).language, undefined);
    })
  );

  it.effect(
    "subject().predicate().literal() - should build and add a language-tagged literal quad",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alicia", "es").add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      assertTrue(quad.object instanceof Literal);
      strictEqual((quad.object as Literal).value, "Alicia");
      strictEqual((quad.object as Literal).language, "es");
    })
  );

  it.effect(
    "subject().predicate().typedLiteral() - should build and add a typed literal quad (xsd:integer)",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder
        .subject(fixtures.alice)
        .predicate(fixtures.foafAge)
        .typedLiteral("30", fixtures.xsdInteger)
        .add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafAge,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      assertTrue(quad.object instanceof Literal);
      strictEqual((quad.object as Literal).value, "30");
      strictEqual((quad.object as Literal).datatype, fixtures.xsdInteger);
    })
  );

  it.effect(
    "subject().predicate().typedLiteral() - should build and add a typed literal quad (xsd:date)",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder
        .subject(fixtures.alice)
        .predicate(makeIRI(`${FOAF}birthday`))
        .typedLiteral("1990-05-15", fixtures.xsdDate)
        .add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      assertTrue(quad.object instanceof Literal);
      strictEqual((quad.object as Literal).value, "1990-05-15");
      strictEqual((quad.object as Literal).datatype, fixtures.xsdDate);
    })
  );

  it.effect(
    "subject().predicate().object() - should build and add a quad with IRI object",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      strictEqual(quad.object, fixtures.bob);
    })
  );

  it.effect(
    "subject().predicate().object() - should build and add a quad with BlankNode object",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.blankB1).add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      strictEqual(quad.object, fixtures.blankB1);
    })
  );

  it.effect(
    "BlankNode subjects - should build and add a quad with BlankNode subject",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.blankB1).predicate(fixtures.foafName).literal("Anonymous").add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.blankB1,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      strictEqual(quad.subject, fixtures.blankB1);
    })
  );

  it.effect(
    "inGraph() - should build and add a quad in a named graph",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder
        .inGraph(fixtures.graph1)
        .subject(fixtures.alice)
        .predicate(fixtures.foafName)
        .literal("Alice")
        .add();

      const results = yield* store.match(
        new QuadPattern({
          graph: fixtures.graph1,
        })
      );

      strictEqual(A.length(results), 1);
      const quad = A.unsafeGet(results, 0);
      strictEqual(quad.graph, fixtures.graph1);
      strictEqual(quad.subject, fixtures.alice);
    })
  );

  it.effect(
    "inGraph() - should add quads to different named graphs",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder
        .inGraph(fixtures.graph1)
        .subject(fixtures.alice)
        .predicate(fixtures.foafName)
        .literal("Alice in Graph 1")
        .add();

      yield* builder
        .inGraph(fixtures.graph2)
        .subject(fixtures.alice)
        .predicate(fixtures.foafName)
        .literal("Alice in Graph 2")
        .add();

      const graph1Results = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
      const graph2Results = yield* store.match(new QuadPattern({ graph: fixtures.graph2 }));

      strictEqual(A.length(graph1Results), 1);
      strictEqual(A.length(graph2Results), 1);
    })
  );

  it.effect(
    "build() - should build a quad without adding it to the store",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      const quad = builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").build();

      assertTrue(quad instanceof Quad);
      strictEqual(quad.subject, fixtures.alice);
      strictEqual(quad.predicate, fixtures.foafName);
      assertTrue(quad.object instanceof Literal);

      const results = yield* store.match(new QuadPattern({}));
      strictEqual(A.length(results), 0);
    })
  );

  it.effect(
    "build() - should build a quad in a named graph without adding",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      const quad = builder
        .inGraph(fixtures.graph1)
        .subject(fixtures.alice)
        .predicate(fixtures.foafKnows)
        .object(fixtures.bob)
        .build();

      strictEqual(quad.graph, fixtures.graph1);
      strictEqual(quad.subject, fixtures.alice);
      strictEqual(quad.object, fixtures.bob);

      const size = yield* store.size;
      strictEqual(size, 0);
    })
  );

  it.effect(
    "predicate chaining - should chain multiple predicates for the same subject",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder
        .subject(fixtures.alice)
        .predicate(fixtures.foafName)
        .literal("Alice")
        .predicate(fixtures.foafAge)
        .typedLiteral("30", fixtures.xsdInteger)
        .add();

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

      const nameResults = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
        })
      );
      const ageResults = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafAge,
        })
      );

      strictEqual(A.length(nameResults), 1);
      strictEqual(A.length(ageResults), 1);
    })
  );

  it.effect(
    "batch() - should add multiple quads in batch",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

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

      yield* builder.batch(quads);

      const size = yield* store.size;
      strictEqual(size, 3);
    })
  );

  it.effect(
    "batch() - should handle empty batch gracefully",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.batch([]);

      const size = yield* store.size;
      strictEqual(size, 0);
    })
  );

  it.effect(
    "batch() - should add batch with quads in named graphs",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      const quads = [
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
      ];

      yield* builder.batch(quads);

      const graph1Results = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
      const graph2Results = yield* store.match(new QuadPattern({ graph: fixtures.graph2 }));

      strictEqual(A.length(graph1Results), 1);
      strictEqual(A.length(graph2Results), 1);
    })
  );

  it.effect(
    "integration - should work with store's match and remove operations",
    Effect.fn(function* () {
      const store = yield* RdfStore;
      yield* store.clear();
      const builder = yield* RdfBuilder;

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

      yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.carol).add();

      const results = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
        })
      );
      strictEqual(A.length(results), 2);

      yield* store.removeQuad(A.unsafeGet(results, 0));

      const afterRemove = yield* store.match(
        new QuadPattern({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
        })
      );
      strictEqual(A.length(afterRemove), 1);
    })
  );
});
