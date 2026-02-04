/**
 * RDF Performance Benchmark Tests
 *
 * Performance benchmarks for RDF store operations targeting Phase 3 specification:
 * - Batch add 1000 quads in under 100ms
 * - Match performance after bulk load
 * - Serialization performance
 *
 * @module knowledge-server/test/Rdf/benchmark.test
 * @since 0.1.0
 */
import { Literal, makeIRI, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfBuilder } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { Serializer } from "@beep/knowledge-server/Rdf/Serializer";
import { assertTrue, describe, live, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

/**
 * Test layer combining all RDF services
 * We must use Layer.provideMerge so that:
 * 1. RdfStore.Default is provided to both Serializer.Default and RdfBuilder.Default
 * 2. The SAME RdfStore instance is exposed for direct test access
 */
const TestLayer = Layer.mergeAll(RdfBuilder.Default, Serializer.Default).pipe(Layer.provideMerge(RdfStore.Default));

/**
 * Common namespace for test fixtures
 */
const EX = "http://example.org/";

/**
 * Generate N test quads with unique subjects
 *
 * @param n - Number of quads to generate
 * @returns ReadonlyArray of Quad instances
 */
const generateTestQuads = (n: number): ReadonlyArray<Quad> =>
  A.makeBy(
    n,
    (i) =>
      new Quad({
        subject: makeIRI(`${EX}entity/${i}`),
        predicate: makeIRI(`${EX}value`),
        object: new Literal({ value: `Value ${i}` }),
      })
  );

/**
 * Measure execution time of an Effect in milliseconds
 *
 * @param effect - The effect to measure
 * @returns Effect yielding the duration in milliseconds
 */
const measureMs: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<number, E, R> = Effect.fn(function* <
  A,
  E,
  R,
>(effect: Effect.Effect<A, E, R>) {
  const start = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
  yield* effect;
  const end = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
  return end - start;
});

describe("Rdf Performance Benchmarks", () => {
  describe("Batch Operations", () => {
    live(
      "should add 1000 quads via batch in under 100ms",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        const quads = generateTestQuads(1000);

        const duration = yield* measureMs(builder.batch(quads));

        yield* Effect.logInfo("Batch add 1000 quads completed", {
          durationMs: duration,
          quadCount: 1000,
          threshold: 100,
        });

        // Verify quads were added
        const size = yield* store.size;
        strictEqual(size, 1000);

        // Assert performance threshold
        assertTrue(duration < 100, `Expected <100ms, got ${duration}ms`);
      }, Effect.provide(TestLayer))
    );

    live(
      "should document individual add performance baseline",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const quads = generateTestQuads(1000);

        const duration = yield* measureMs(Effect.forEach(quads, (quad) => store.addQuad(quad), { discard: true }));

        yield* Effect.logInfo("Individual add 1000 quads completed", {
          durationMs: duration,
          quadCount: 1000,
          avgPerQuad: duration / 1000,
        });

        // Verify quads were added
        const size = yield* store.size;
        strictEqual(size, 1000);

        // Document but do not enforce threshold for individual adds
        // This establishes a baseline for comparison with batch operations
        yield* Effect.logInfo("Performance comparison", {
          individualMs: duration,
          note: "Individual adds expected to be slower than batch",
        });
      }, Effect.provide(TestLayer))
    );
  });

  describe("Query Performance", () => {
    live(
      "should match after bulk load efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;

        // Load 1000 quads
        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        // Measure match by subject pattern
        const subjectPattern = new QuadPattern({
          subject: makeIRI(`${EX}entity/500`),
        });

        const matchDuration = yield* measureMs(store.match(subjectPattern));

        yield* Effect.logInfo("Match single subject after 1000 quads", {
          durationMs: matchDuration,
          storeSize: 1000,
        });

        // Match should be very fast (indexed operation)
        assertTrue(matchDuration < 10, `Expected <10ms for indexed match, got ${matchDuration}ms`);

        // Measure match by predicate (matches all quads)
        const predicatePattern = new QuadPattern({
          predicate: makeIRI(`${EX}value`),
        });

        const matchAllDuration = yield* measureMs(store.match(predicatePattern));

        yield* Effect.logInfo("Match all quads by predicate", {
          durationMs: matchAllDuration,
          expectedResults: 1000,
        });

        // Even matching all 1000 should be reasonably fast
        assertTrue(matchAllDuration < 50, `Expected <50ms for full predicate match, got ${matchAllDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live(
      "should count matches efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;

        // Load 1000 quads
        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const wildcardPattern = new QuadPattern({});
        const countDuration = yield* measureMs(store.countMatches(wildcardPattern));

        yield* Effect.logInfo("Count all quads", {
          durationMs: countDuration,
          count: 1000,
        });

        assertTrue(countDuration < 10, `Expected <10ms for count, got ${countDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });

  describe("Serialization Performance", () => {
    live(
      "should serialize 1000 quads to Turtle efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;

        // Load 1000 quads
        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const serializeDuration = yield* measureMs(serializer.serialize("Turtle"));

        yield* Effect.logInfo("Serialize 1000 quads to Turtle", {
          durationMs: serializeDuration,
          quadCount: 1000,
        });

        // Serialization of 1000 quads should complete in reasonable time
        // Turtle format is more complex (prefix handling, grouping) - allow 500ms
        assertTrue(serializeDuration < 500, `Expected <500ms for Turtle serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live(
      "should serialize 1000 quads to N-Triples efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;

        // Load 1000 quads
        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const serializeDuration = yield* measureMs(serializer.serialize("NTriples"));

        yield* Effect.logInfo("Serialize 1000 quads to N-Triples", {
          durationMs: serializeDuration,
          quadCount: 1000,
        });

        // N-Triples is simpler format, should be at least as fast as Turtle
        assertTrue(serializeDuration < 200, `Expected <200ms for N-Triples serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live(
      "should serialize quads directly without store efficiently",
      Effect.fn(function* () {
        const serializer = yield* Serializer;
        const quads = generateTestQuads(1000);

        const serializeDuration = yield* measureMs(serializer.serializeQuads(quads, "NTriples"));

        yield* Effect.logInfo("Direct serialize 1000 quads to N-Triples", {
          durationMs: serializeDuration,
          quadCount: 1000,
        });

        // Direct serialization should be efficient
        assertTrue(serializeDuration < 200, `Expected <200ms for direct serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });

  describe("Stress Tests", () => {
    live(
      "should handle 10000 quads batch add",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        const quads = generateTestQuads(10000);

        const duration = yield* measureMs(builder.batch(quads));

        yield* Effect.logInfo("Batch add 10000 quads completed", {
          durationMs: duration,
          quadCount: 10000,
          throughput: `${Math.round(10000 / (duration / 1000))} quads/sec`,
        });

        // Verify quads were added
        const size = yield* store.size;
        strictEqual(size, 10000);

        // 10000 quads should still be under 1 second
        assertTrue(duration < 1000, `Expected <1000ms for 10000 quads, got ${duration}ms`);
      }, Effect.provide(TestLayer))
    );

    live(
      "should round-trip 1000 quads through serialization",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        // Load 1000 quads
        const originalQuads = generateTestQuads(1000);
        yield* builder.batch(originalQuads);

        // Serialize to Turtle
        const turtle = yield* serializer.serialize("Turtle");

        // Clear store
        yield* store.clear();

        // Parse back
        const roundTripDuration = yield* measureMs(serializer.parseTurtle(turtle));

        yield* Effect.logInfo("Round-trip 1000 quads through Turtle", {
          parseDurationMs: roundTripDuration,
          quadCount: 1000,
        });

        // Verify data integrity
        const size = yield* store.size;
        strictEqual(size, 1000);

        // Parsing should be reasonably fast
        assertTrue(roundTripDuration < 200, `Expected <200ms for parsing, got ${roundTripDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });
});
