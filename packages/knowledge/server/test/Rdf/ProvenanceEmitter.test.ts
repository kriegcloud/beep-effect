import { Literal, QuadPattern } from "@beep/knowledge-domain/value-objects";
import type { KnowledgeGraph } from "@beep/knowledge-server/Extraction/GraphAssembler";
import {
  PROVENANCE_GRAPH_IRI,
  ProvenanceEmitter,
  ProvenanceEmitterLive,
  ProvOConstants,
  RdfStore,
  RdfStoreLive,
} from "@beep/knowledge-server/Rdf";
import { SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const TestLayer = Layer.mergeAll(ProvenanceEmitterLive, RdfStoreLive);

const graphFixture: KnowledgeGraph = {
  entities: [
    {
      id: "entity-1",
      mention: "Alice",
      primaryType: "http://example.org/Person",
      types: ["http://example.org/Person"],
      attributes: { role: "Engineer" },
      confidence: 0.98,
      canonicalName: "Alice",
    },
  ],
  relations: [
    {
      id: "relation-1",
      subjectId: "entity-1",
      predicate: "http://example.org/worksOn",
      literalValue: "Project X",
      confidence: 0.87,
    },
  ],
  entityIndex: {
    alice: "entity-1",
  },
  stats: {
    entityCount: 1,
    relationCount: 1,
    unresolvedSubjects: 0,
    unresolvedObjects: 0,
  },
};

const metadataFixture = {
  extractionId: "extract-123",
  documentId: "doc-123",
  actorUserId: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
  startedAt: DateTime.unsafeFromDate(new Date("2026-01-10T10:00:00.000Z")),
  endedAt: DateTime.unsafeFromDate(new Date("2026-01-10T10:00:05.000Z")),
};

describe("ProvenanceEmitter", () => {
  layer(TestLayer, { timeout: Duration.seconds(30) })("PROV-O emission", (it) => {
    it.effect(
      "emits PROV-O quads in urn:beep:provenance",
      Effect.fn(function* () {
        const emitter = yield* ProvenanceEmitter;

        const emitted = yield* emitter.emitExtraction(graphFixture, metadataFixture);

        strictEqual(emitted.provenanceGraphIri, PROVENANCE_GRAPH_IRI);
        assertTrue(A.length(emitted.graphQuads) > 0);
        assertTrue(A.length(emitted.provenanceQuads) > 0);

        assertTrue(
          A.every(emitted.provenanceQuads, (q) => {
            return q.graph === PROVENANCE_GRAPH_IRI;
          })
        );

        const hasActivityType = A.some(
          emitted.provenanceQuads,
          (q) => q.predicate === ProvOConstants.rdfType && q.object === ProvOConstants.Activity
        );
        const hasGenerationLink = A.some(emitted.provenanceQuads, (q) => q.predicate === ProvOConstants.wasGeneratedBy);

        assertTrue(hasActivityType);
        assertTrue(hasGenerationLink);
      })
    );

    it.effect(
      "stores extraction and provenance quads with graph isolation",
      Effect.fn(function* () {
        const emitter = yield* ProvenanceEmitter;
        const store = yield* RdfStore;
        yield* store.clear();

        const emitted = yield* emitter.emitExtraction(graphFixture, metadataFixture);

        yield* store.createGraph(emitted.extractionGraphIri);
        yield* store.createGraph(emitted.provenanceGraphIri);
        yield* store.addQuads(emitted.graphQuads);
        yield* store.addQuads(emitted.provenanceQuads);

        const listedGraphs = yield* store.listGraphs();
        assertTrue(A.contains(listedGraphs, emitted.extractionGraphIri));
        assertTrue(A.contains(listedGraphs, PROVENANCE_GRAPH_IRI));

        const provenanceQuads = yield* store.match(new QuadPattern({ graph: PROVENANCE_GRAPH_IRI }));
        assertTrue(A.length(provenanceQuads) > 0);

        const extractionQuads = yield* store.match(new QuadPattern({ graph: emitted.extractionGraphIri }));
        assertTrue(A.length(extractionQuads) > 0);

        const startedAtQuad = A.findFirst(provenanceQuads, (q) => q.predicate === ProvOConstants.startedAtTime);
        assertTrue(O.isSome(startedAtQuad));
        assertTrue(startedAtQuad.value.object instanceof Literal);
      })
    );
  });
});
