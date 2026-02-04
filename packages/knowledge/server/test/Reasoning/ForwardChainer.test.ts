/**
 * Forward Chainer Tests
 *
 * Tests for the forward-chaining inference engine.
 *
 * @module knowledge-server/test/Reasoning/ForwardChainer
 * @since 0.1.0
 */
import { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import { type InferenceProvenance, IRI, Quad, ReasoningConfig } from "@beep/knowledge-domain/value-objects";
import { forwardChain } from "@beep/knowledge-server/Reasoning/ForwardChainer";
import { assertTrue, describe, live, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";

const RDF_TYPE = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const RDFS_DOMAIN = IRI.make("http://www.w3.org/2000/01/rdf-schema#domain");
const RDFS_SUBCLASS_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subClassOf");

const EX = "http://example.org/";

const fixtures = {
  alice: IRI.make(`${EX}alice`),
  bob: IRI.make(`${EX}bob`),
  enrolledIn: IRI.make(`${EX}enrolledIn`),
  CS101: IRI.make(`${EX}CS101`),
  Student: IRI.make(`${EX}Student`),
  Person: IRI.make(`${EX}Person`),
  Agent: IRI.make(`${EX}Agent`),
};

describe("ForwardChainer", () => {
  describe("fixed-point convergence", () => {
    live(
      "reaches fixed point with simple rdfs9 ontology",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          assertTrue(A.length(result.derivedTriples) >= 1);
          assertTrue(result.stats.iterations > 0);
          assertTrue(result.stats.triplesInferred >= 1);

          const hasPersonType = A.some(
            result.derivedTriples,
            (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Person
          );
          assertTrue(hasPersonType);
        }) as Effect.Effect<void>
    );

    live(
      "reaches fixed point with multi-level subclass chain",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
            new Quad({
              subject: fixtures.Person,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Agent,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          const hasPersonType = A.some(
            result.derivedTriples,
            (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Person
          );
          const hasAgentType = A.some(
            result.derivedTriples,
            (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Agent
          );

          assertTrue(hasPersonType);
          assertTrue(hasAgentType);
        }) as Effect.Effect<void>
    );

    live(
      "combines domain inference with subclass entailment",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.enrolledIn,
              predicate: RDFS_DOMAIN,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.alice,
              predicate: fixtures.enrolledIn,
              object: fixtures.CS101,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          const hasStudentType = A.some(
            result.derivedTriples,
            (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Student
          );
          const hasPersonType = A.some(
            result.derivedTriples,
            (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Person
          );

          assertTrue(hasStudentType);
          assertTrue(hasPersonType);
        }) as Effect.Effect<void>
    );

    live(
      "returns empty result for empty input",
      () =>
        Effect.gen(function* () {
          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain([], config);

          strictEqual(A.length(result.derivedTriples), 0);
          strictEqual(result.stats.triplesInferred, 0);
        }) as Effect.Effect<void>
    );

    live(
      "returns empty result when no rules apply",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: IRI.make(`${EX}likes`),
              object: fixtures.bob,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          strictEqual(A.length(result.derivedTriples), 0);
          strictEqual(result.stats.triplesInferred, 0);
          strictEqual(result.stats.iterations, 1);
        }) as Effect.Effect<void>
    );
  });

  describe("deduplication", () => {
    live(
      "deduplicates initial quads",
      () =>
        Effect.gen(function* () {
          const quad = new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          });

          const quads = [quad, quad, quad];
          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          strictEqual(result.stats.triplesInferred, 0);
        }) as Effect.Effect<void>
    );

    live(
      "does not duplicate inferred triples",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          const personTypeCount = A.length(
            A.filter(
              result.derivedTriples,
              (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Person
            )
          );

          strictEqual(personTypeCount, 1);
        }) as Effect.Effect<void>
    );
  });

  describe("provenance tracking", () => {
    live(
      "tracks provenance for inferred triples",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          const provenanceKeys = Object.keys(result.provenance);
          assertTrue(A.length(provenanceKeys) > 0);

          for (const key of provenanceKeys) {
            const entry = result.provenance[key];
            assertTrue(entry !== undefined);
            assertTrue(entry.ruleId.length > 0);
            assertTrue(A.length(entry.sourceQuads) > 0);
          }
        }) as Effect.Effect<void>
    );

    live(
      "records rdfs9 rule in provenance",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          const provenanceEntries = Object.values(result.provenance) as InferenceProvenance[];
          const hasRdfs9 = A.some(provenanceEntries, (e: InferenceProvenance) => e.ruleId === "rdfs9");
          assertTrue(hasRdfs9);
        }) as Effect.Effect<void>
    );
  });

  describe("statistics", () => {
    live(
      "records iteration count",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
            new Quad({
              subject: fixtures.Person,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Agent,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          assertTrue(result.stats.iterations >= 1);
        }) as Effect.Effect<void>
    );

    live(
      "records triples inferred count",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          strictEqual(result.stats.triplesInferred, A.length(result.derivedTriples));
        }) as Effect.Effect<void>
    );

    live(
      "records duration in milliseconds",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          assertTrue(result.stats.durationMs >= 0);
        }) as Effect.Effect<void>
    );
  });

  describe("depth limit", () => {
    live(
      "respects max depth and fails when exceeded mid-inference",
      () =>
        Effect.gen(function* () {
          const classChain = A.map(
            A.range(0, 19),
            (i) =>
              new Quad({
                subject: IRI.make(`${EX}Class${i}`),
                predicate: RDFS_SUBCLASS_OF,
                object: IRI.make(`${EX}Class${i + 1}`),
              })
          );
          const classes = A.append(
            classChain,
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: IRI.make(`${EX}Class0`),
            })
          );

          const config = new ReasoningConfig({ maxDepth: 3, maxInferences: 10000 });
          const result = yield* Effect.either(forwardChain(classes, config));

          assertTrue(Either.isLeft(result));
          Either.match(result, {
            onLeft: (err: unknown) => assertTrue(err instanceof MaxDepthExceededError),
            onRight: () => assertTrue(false),
          });
        }) as Effect.Effect<void>
    );

    live(
      "succeeds within depth limit when fixed-point reached",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 5, maxInferences: 1000 });
          const result = yield* forwardChain(quads, config);

          assertTrue(result.stats.iterations <= 5);
          assertTrue(A.length(result.derivedTriples) >= 1);
        }) as Effect.Effect<void>
    );
  });

  describe("inference limit", () => {
    live(
      "fails when inference limit exceeded",
      () =>
        Effect.gen(function* () {
          const instanceQuads = A.map(
            A.range(0, 9),
            (i) =>
              new Quad({
                subject: IRI.make(`${EX}instance${i}`),
                predicate: RDF_TYPE,
                object: fixtures.Student,
              })
          );
          const quads = A.appendAll(instanceQuads, [
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
            new Quad({
              subject: fixtures.Person,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Agent,
            }),
          ]);

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 5 });
          const result = yield* Effect.either(forwardChain(quads, config));

          assertTrue(Either.isLeft(result));
          Either.match(result, {
            onLeft: (err: unknown) => assertTrue(err instanceof MaxInferencesExceededError),
            onRight: () => assertTrue(false),
          });
        }) as Effect.Effect<void>
    );

    live(
      "succeeds within inference limit",
      () =>
        Effect.gen(function* () {
          const quads = [
            new Quad({
              subject: fixtures.alice,
              predicate: RDF_TYPE,
              object: fixtures.Student,
            }),
            new Quad({
              subject: fixtures.Student,
              predicate: RDFS_SUBCLASS_OF,
              object: fixtures.Person,
            }),
          ];

          const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 100 });
          const result = yield* forwardChain(quads, config);

          assertTrue(result.stats.triplesInferred <= 100);
        }) as Effect.Effect<void>
    );
  });

  describe("default configuration", () => {
    live("uses default config values when provided empty object", () =>
      Effect.gen(function* () {
        const quads = [
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          }),
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          }),
        ];

        const config = new ReasoningConfig({});
        const result = yield* forwardChain(quads, config);

        assertTrue(A.length(result.derivedTriples) >= 1);
      })
    );
  });
});
