import { IRI, Literal, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfBuilder } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { Serializer } from "@beep/knowledge-server/Rdf/Serializer";
import { assertTrue, describe, live, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";
import { makeRdfBuilderSerializerLayer } from "../_shared/LayerBuilders";

const TestLayer = makeRdfBuilderSerializerLayer();
const RUN_BENCHMARKS = process.env.BEEP_RUN_BENCHMARKS === "1";

const EX = "http://example.org/";

const generateTestQuads = (n: number): ReadonlyArray<Quad> =>
  A.makeBy(
    n,
    (i) =>
      new Quad({
        subject: IRI.make(`${EX}entity/${i}`),
        predicate: IRI.make(`${EX}value`),
        object: new Literal({ value: `Value ${i}` }),
      })
  );

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
    live.runIf(RUN_BENCHMARKS)(
      "should add 1000 quads via batch in under 100ms",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        const quads = generateTestQuads(1000);

        const duration = yield* measureMs(builder.batch(quads));

        yield* Effect.logInfo("Batch add 1000 quads completed").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            quadCount: 1000,
            threshold: 100,
          })
        );

        const size = yield* store.size;
        strictEqual(size, 1000);

        assertTrue(duration < 100, `Expected <100ms, got ${duration}ms`);
      }, Effect.provide(TestLayer))
    );

    live.runIf(RUN_BENCHMARKS)(
      "should document individual add performance baseline",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const quads = generateTestQuads(1000);

        const duration = yield* measureMs(Effect.forEach(quads, (quad) => store.addQuad(quad), { discard: true }));

        yield* Effect.logInfo("Individual add 1000 quads completed").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            quadCount: 1000,
            avgPerQuad: duration / 1000,
          })
        );

        const size = yield* store.size;
        strictEqual(size, 1000);

        yield* Effect.logInfo("Performance comparison").pipe(
          Effect.annotateLogs({
            individualMs: duration,
            note: "Individual adds expected to be slower than batch",
          })
        );
      }, Effect.provide(TestLayer))
    );
  });

  describe("Query Performance", () => {
    live.runIf(RUN_BENCHMARKS)(
      "should match after bulk load efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;

        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const subjectPattern = new QuadPattern({
          subject: IRI.make(`${EX}entity/500`),
        });

        const matchDuration = yield* measureMs(store.match(subjectPattern));

        yield* Effect.logInfo("Match single subject after 1000 quads").pipe(
          Effect.annotateLogs({
            durationMs: matchDuration,
            storeSize: 1000,
          })
        );

        assertTrue(matchDuration < 50, `Expected <50ms for indexed match, got ${matchDuration}ms`);

        const predicatePattern = new QuadPattern({
          predicate: IRI.make(`${EX}value`),
        });

        const matchAllDuration = yield* measureMs(store.match(predicatePattern));

        yield* Effect.logInfo("Match all quads by predicate").pipe(
          Effect.annotateLogs({
            durationMs: matchAllDuration,
            expectedResults: 1000,
          })
        );

        assertTrue(matchAllDuration < 200, `Expected <200ms for full predicate match, got ${matchAllDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live.runIf(RUN_BENCHMARKS)(
      "should count matches efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;

        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const wildcardPattern = new QuadPattern({});
        const countDuration = yield* measureMs(store.countMatches(wildcardPattern));

        yield* Effect.logInfo("Count all quads").pipe(
          Effect.annotateLogs({
            durationMs: countDuration,
            count: 1000,
          })
        );

        assertTrue(countDuration < 10, `Expected <10ms for count, got ${countDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });

  describe("Serialization Performance", () => {
    live.runIf(RUN_BENCHMARKS)(
      "should serialize 1000 quads to Turtle efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;

        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const serializeDuration = yield* measureMs(serializer.serialize("Turtle"));

        yield* Effect.logInfo("Serialize 1000 quads to Turtle").pipe(
          Effect.annotateLogs({
            durationMs: serializeDuration,
            quadCount: 1000,
          })
        );

        assertTrue(serializeDuration < 500, `Expected <500ms for Turtle serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live.runIf(RUN_BENCHMARKS)(
      "should serialize 1000 quads to N-Triples efficiently",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;

        const quads = generateTestQuads(1000);
        yield* builder.batch(quads);

        const serializeDuration = yield* measureMs(serializer.serialize("NTriples"));

        yield* Effect.logInfo("Serialize 1000 quads to N-Triples").pipe(
          Effect.annotateLogs({
            durationMs: serializeDuration,
            quadCount: 1000,
          })
        );

        assertTrue(serializeDuration < 200, `Expected <200ms for N-Triples serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );

    live.runIf(RUN_BENCHMARKS)(
      "should serialize quads directly without store efficiently",
      Effect.fn(function* () {
        const serializer = yield* Serializer;
        const quads = generateTestQuads(1000);

        const serializeDuration = yield* measureMs(serializer.serializeQuads(quads, "NTriples"));

        yield* Effect.logInfo("Direct serialize 1000 quads to N-Triples").pipe(
          Effect.annotateLogs({
            durationMs: serializeDuration,
            quadCount: 1000,
          })
        );

        assertTrue(serializeDuration < 200, `Expected <200ms for direct serialization, got ${serializeDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });

  describe("Stress Tests", () => {
    live.runIf(RUN_BENCHMARKS)(
      "should handle 10000 quads batch add",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        const quads = generateTestQuads(10000);

        const duration = yield* measureMs(builder.batch(quads));

        yield* Effect.logInfo("Batch add 10000 quads completed").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            quadCount: 10000,
            throughput: `${Num.round(10000 / (duration / 1000))} quads/sec`,
          })
        );

        const size = yield* store.size;
        strictEqual(size, 10000);

        assertTrue(duration < 1000, `Expected <1000ms for 10000 quads, got ${duration}ms`);
      }, Effect.provide(TestLayer))
    );

    live.runIf(RUN_BENCHMARKS)(
      "should round-trip 1000 quads through serialization",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        const originalQuads = generateTestQuads(1000);
        yield* builder.batch(originalQuads);

        const turtle = yield* serializer.serialize("Turtle");

        yield* store.clear();

        const roundTripDuration = yield* measureMs(serializer.parseTurtle(turtle));

        yield* Effect.logInfo("Round-trip 1000 quads through Turtle").pipe(
          Effect.annotateLogs({
            parseDurationMs: roundTripDuration,
            quadCount: 1000,
          })
        );

        const size = yield* store.size;
        strictEqual(size, 1000);

        assertTrue(roundTripDuration < 500, `Expected <500ms for parsing, got ${roundTripDuration}ms`);
      }, Effect.provide(TestLayer))
    );
  });
});
