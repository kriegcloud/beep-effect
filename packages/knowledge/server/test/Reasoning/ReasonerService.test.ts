import { IRI, Quad, QuadPattern, ReasoningConfig } from "@beep/knowledge-domain/value-objects";
import { RdfStore, RdfStoreLive } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { ReasonerService, ReasonerServiceLive } from "@beep/knowledge-server/Reasoning/ReasonerService";
import { assertTrue, describe, live, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as R from "effect/Record";

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

const makeTestLayer = () => Layer.provideMerge(ReasonerServiceLive, RdfStoreLive);

describe("ReasonerService", () => {
  describe("infer", () => {
    live(
      "infers from populated store",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        const result = yield* reasonerService.infer();

        assertTrue(result.stats.triplesInferred >= 1);

        const hasPersonType = A.some(
          result.derivedTriples,
          (q: Quad) => q.subject === fixtures.alice && q.predicate === RDF_TYPE && q.object === fixtures.Person
        );
        assertTrue(hasPersonType);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "returns empty result for empty store",
      Effect.fn(function* () {
        const reasonerService = yield* ReasonerService;
        const result = yield* reasonerService.infer();

        strictEqual(result.stats.triplesInferred, 0);
        strictEqual(A.length(result.derivedTriples), 0);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "accepts custom config",
      Effect.fn(function* () {
        const reasonerService = yield* ReasonerService;
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        const config = new ReasoningConfig({ maxDepth: 5, maxInferences: 100 });
        const result = yield* reasonerService.infer(config);

        assertTrue(result.stats.triplesInferred >= 1);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "combines domain and subclass inferences",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuads([
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
        ]);

        const result = yield* reasonerService.infer();

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
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "fails with MaxDepthExceededError for deep hierarchies",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        const classChain = A.map(
          A.range(0, 19),
          (i) =>
            new Quad({
              subject: IRI.make(`${EX}Class${i}`),
              predicate: RDFS_SUBCLASS_OF,
              object: IRI.make(`${EX}Class${i + 1}`),
            })
        );
        const quads = A.append(
          classChain,
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: IRI.make(`${EX}Class0`),
          })
        );

        yield* store.addQuads(quads);

        const config = new ReasoningConfig({ maxDepth: 3, maxInferences: 10000 });
        const result = yield* Effect.either(reasonerService.infer(config));

        assertTrue(Either.isLeft(result));
        Either.match(result, {
          onLeft: (err) => strictEqual(err._tag, "MaxDepthExceededError"),
          onRight: () => assertTrue(false),
        });
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "fails with MaxInferencesExceededError for many inferences",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        const instanceQuads = A.map(
          A.range(0, 19),
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

        yield* store.addQuads(quads);

        const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 5 });
        const result = yield* Effect.either(reasonerService.infer(config));

        assertTrue(Either.isLeft(result));
        Either.match(result, {
          onLeft: (err) => strictEqual(err._tag, "MaxInferencesExceededError"),
          onRight: () => assertTrue(false),
        });
      }, Effect.provide(makeTestLayer()))
    );
  });

  describe("inferAndMaterialize", () => {
    live(
      "does not modify store when materialize is false",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        const beforeCount = yield* store.size;

        yield* reasonerService.inferAndMaterialize(new ReasoningConfig({}), false);

        const afterCount = yield* store.size;

        strictEqual(afterCount, beforeCount);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "adds inferred triples to store when materialize is true",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        const beforeCount = yield* store.size;

        const result = yield* reasonerService.inferAndMaterialize(new ReasoningConfig({}), true);

        const afterCount = yield* store.size;

        assertTrue(afterCount > beforeCount);
        strictEqual(afterCount, beforeCount + result.stats.triplesInferred);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "materialized triples are queryable",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        yield* reasonerService.inferAndMaterialize(new ReasoningConfig({}), true);

        const pattern = new QuadPattern({
          subject: fixtures.alice,
          predicate: RDF_TYPE,
          object: fixtures.Person,
        });
        const results = yield* store.match(pattern);

        strictEqual(A.length(results), 1);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "no-op when no inferences generated",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: IRI.make(`${EX}likes`),
            object: fixtures.bob,
          })
        );

        const beforeCount = yield* store.size;

        yield* reasonerService.inferAndMaterialize(new ReasoningConfig({}), true);

        const afterCount = yield* store.size;

        strictEqual(afterCount, beforeCount);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "defaults to not materializing",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );
        yield* store.addQuad(
          new Quad({
            subject: fixtures.Student,
            predicate: RDFS_SUBCLASS_OF,
            object: fixtures.Person,
          })
        );

        const beforeCount = yield* store.size;

        yield* reasonerService.inferAndMaterialize(new ReasoningConfig({}));

        const afterCount = yield* store.size;

        strictEqual(afterCount, beforeCount);
      }, Effect.provide(makeTestLayer()))
    );
  });

  describe("store isolation", () => {
    live(
      "each test gets fresh store instance",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const size = yield* store.size;

        strictEqual(size, 0);
      }, Effect.provide(makeTestLayer()))
    );

    live(
      "modifications do not persist across tests",
      Effect.fn(function* () {
        const store = yield* RdfStore;

        yield* store.addQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: RDF_TYPE,
            object: fixtures.Student,
          })
        );

        const size = yield* store.size;
        strictEqual(size, 1);
      }, Effect.provide(makeTestLayer()))
    );
  });

  describe("provenance in results", () => {
    live(
      "includes provenance for all inferred triples",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        const reasonerService = yield* ReasonerService;
        yield* store.addQuads([
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
        ]);

        const result = yield* reasonerService.infer();

        const provenanceCount = A.length(R.keys(result.provenance));
        strictEqual(provenanceCount, result.stats.triplesInferred);
      }, Effect.provide(makeTestLayer()))
    );
  });
});
