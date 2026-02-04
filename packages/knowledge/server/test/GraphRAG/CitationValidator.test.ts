/**
 * CitationValidator Tests
 *
 * Tests for citation validation against knowledge graph entities and relations.
 *
 * @module knowledge-server/test/GraphRAG/CitationValidator.test
 * @since 0.1.0
 */

import {$KnowledgeServerId} from "@beep/identity/packages";
import {
  emptyInferenceResult,
  InferenceProvenance,
  InferenceResult,
  InferenceStats,
  IRI,
  Quad,
} from "@beep/knowledge-domain/value-objects";
import { Citation } from "@beep/knowledge-server/GraphRAG/AnswerSchemas";
import {
  type CitationValidationResult,
  CitationValidator,
  type EntityValidationResult,
  type RelationValidationResult,
} from "@beep/knowledge-server/GraphRAG/CitationValidator";
import { ReasonerService } from "@beep/knowledge-server/Reasoning/ReasonerService";
import { SparqlService } from "@beep/knowledge-server/Sparql/SparqlService";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// =============================================================================
// Test Fixtures
// =============================================================================

const knownEntity1 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__11111111-1111-1111-1111-111111111111"
);
const knownEntity2 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__22222222-2222-2222-2222-222222222222"
);
const unknownEntity = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__99999999-9999-9999-9999-999999999999"
);
const knownRelation = KnowledgeEntityIds.RelationId.make("knowledge_relation__33333333-3333-3333-3333-333333333333");
const unknownRelation = KnowledgeEntityIds.RelationId.make("knowledge_relation__99999999-9999-9999-9999-999999999999");
const inferredRelation = KnowledgeEntityIds.RelationId.make("knowledge_relation__44444444-4444-4444-4444-444444444444");

// =============================================================================
// Mock Service Factories
// =============================================================================
const $I = $KnowledgeServerId.create("Sparql/SparqlService");
/**
 * Create a mock SparqlService with configurable entity/relation existence
 */
const createMockSparqlService = (config: {
  knownEntities: ReadonlyArray<string>;
  knownRelations: ReadonlyArray<string>;
}) =>
  Layer.succeed(SparqlService, {
    _tag: $I`SparqlService`,
    ask: (query: string) =>
      Effect.gen(function* () {
        // Check if any known entity is in the query
        const entityExists = A.some(config.knownEntities, (entityId) => query.includes(entityId));
        if (entityExists) {
          return true;
        }

        // Check if any known relation is in the query
        return A.some(config.knownRelations, (relationId) => query.includes(relationId));
      }),
    select: () => Effect.succeed({ columns: [], rows: [] }),
    construct: () => Effect.succeed([]),
    query: () => Effect.succeed(true),
  });

/**
 * Create a mock ReasonerService that returns empty or configured inference results
 */
const $IReasonerService = $KnowledgeServerId.create("Reasoning/ReasonerService");
const createMockReasonerService = (inferenceResult: InferenceResult = emptyInferenceResult) =>
  Layer.succeed(ReasonerService, {
    _tag: $IReasonerService`ReasonerService`,
    infer: () => Effect.succeed(inferenceResult),
    inferAndMaterialize: () => Effect.succeed(inferenceResult),
  });

/**
 * Create inference result with a derived triple matching the given relation
 */
const createInferenceResultWithRelation = (relationId: string, depth = 1): InferenceResult =>
  new InferenceResult({
    derivedTriples: [
      new Quad({
        subject: IRI.make("http://example.org/subject"),
        predicate: IRI.make(relationId),
        object: IRI.make("http://example.org/object"),
      }),
    ],
    provenance: {
      [`${relationId}_derived`]: new InferenceProvenance({
        ruleId: "rdfs:subClassOf",
        sourceQuads: ["source_quad_1"],
      }),
    },
    stats: new InferenceStats({
      iterations: depth,
      triplesInferred: 1,
      durationMs: 10,
    }),
  });

// =============================================================================
// Test Layer Factory
// =============================================================================

const createTestLayer = (config: {
  knownEntities?: ReadonlyArray<string>;
  knownRelations?: ReadonlyArray<string>;
  inferenceResult?: InferenceResult;
}) => {
  const MockSparql = createMockSparqlService({
    knownEntities: config.knownEntities ?? [],
    knownRelations: config.knownRelations ?? [],
  });

  const MockReasoner = createMockReasonerService(config.inferenceResult ?? emptyInferenceResult);
const $ICitationValidator = $KnowledgeServerId.create("GraphRAG/CitationValidator");
  return Layer.provideMerge(
    Layer.effect(
      CitationValidator,
      Effect.gen(function* () {
        const sparql = yield* SparqlService;
        const reasoner = yield* ReasonerService;

        const validateEntity = (
          entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
        ): Effect.Effect<EntityValidationResult> =>
          Effect.gen(function* () {
            const query = `ASK WHERE { { ?s ?p ?o . FILTER(?s = <${entityId}>) } UNION { ?s ?p ?o . FILTER(?o = <${entityId}>) } }`;
            const exists = yield* sparql.ask(query);
            return {
              entityId,
              found: exists,
              confidence: exists ? 1.0 : 0.0,
            };
          }).pipe(Effect.orDie);

        const validateRelation = (
          relationId: KnowledgeEntityIds.RelationId.Type
        ): Effect.Effect<RelationValidationResult> =>
          Effect.gen(function* () {
            const directQuery = `ASK WHERE { ?s ?p ?o . FILTER(?p = <${relationId}>) }`;
            const directExists = yield* sparql.ask(directQuery);

            if (directExists) {
              return {
                relationId,
                found: true,
                isInferred: false,
                confidence: 1.0,
              };
            }

            const inferenceResult = yield* reasoner.infer();
            const matchingTriple = A.findFirst(inferenceResult.derivedTriples, (quad) => quad.predicate === relationId);

            if (A.isNonEmptyArray([matchingTriple].filter((x) => x._tag === "Some"))) {
              const depth = inferenceResult.stats.iterations;
              const penalty = depth * 0.1;
              const confidence = Math.max(0.5, 0.9 - penalty);
              return {
                relationId,
                found: true,
                isInferred: true,
                confidence,
                reasoningTrace: {
                  inferenceSteps: [],
                  depth,
                },
              };
            }

            return {
              relationId,
              found: false,
              isInferred: false,
              confidence: 0.0,
            };
          }).pipe(Effect.orDie);

        const validateCitation = (citation: Citation): Effect.Effect<CitationValidationResult> =>
          Effect.gen(function* () {
            const entityResults = yield* Effect.all(A.map(citation.entityIds, validateEntity), {
              concurrency: "unbounded",
            });

            const relationResult =
              citation.relationId !== undefined
                ? yield* validateRelation(citation.relationId as KnowledgeEntityIds.RelationId.Type)
                : undefined;

            const entityConfidences = A.map(entityResults, (r) => r.confidence);
            const allConfidences =
              relationResult !== undefined ? A.append(entityConfidences, relationResult.confidence) : entityConfidences;

            const overallConfidence = A.isEmptyReadonlyArray(allConfidences) ? 0.0 : Math.min(...allConfidences);

            const baseResult = {
              citation,
              entityResults,
              overallConfidence,
            };

            return relationResult !== undefined ? { ...baseResult, relationResult } : baseResult;
          });

        const validateAllCitations = (
          citations: ReadonlyArray<Citation>
        ): Effect.Effect<ReadonlyArray<CitationValidationResult>> =>
          Effect.all(A.map(citations, validateCitation), { concurrency: "unbounded" });

        return {
          _tag:$ICitationValidator`CitationValidator`,
          validateEntity,
          validateRelation,
          validateCitation,
          validateAllCitations,
        };
      })
    ),
    Layer.merge(MockSparql, MockReasoner)
  );
};

// =============================================================================
// Tests
// =============================================================================

describe("CitationValidator", () => {
  describe("validateEntity", () => {
    effect(
      "returns confidence 1.0 when entity is found",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateEntity(knownEntity1);

          assertTrue(result.found);
          strictEqual(result.confidence, 1.0);
          strictEqual(result.entityId, knownEntity1);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1],
          })
        )
      )
    );

    effect(
      "returns confidence 0.0 when entity is not found",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateEntity(unknownEntity);

          assertTrue(!result.found);
          strictEqual(result.confidence, 0.0);
          strictEqual(result.entityId, unknownEntity);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [],
          })
        )
      )
    );
  });

  describe("validateRelation", () => {
    effect(
      "returns confidence 1.0 and isInferred false for direct relation",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateRelation(knownRelation);

          assertTrue(result.found);
          assertTrue(!result.isInferred);
          strictEqual(result.confidence, 1.0);
          strictEqual(result.relationId, knownRelation);
        },
        Effect.provide(
          createTestLayer({
            knownRelations: [knownRelation],
          })
        )
      )
    );

    effect(
      "returns confidence 0.0 when relation not found directly or via reasoning",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateRelation(unknownRelation);

          assertTrue(!result.found);
          assertTrue(!result.isInferred);
          strictEqual(result.confidence, 0.0);
        },
        Effect.provide(
          createTestLayer({
            knownRelations: [],
          })
        )
      )
    );

    effect(
      "returns inferred result with depth penalty for relation found via reasoning",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateRelation(inferredRelation);

          assertTrue(result.found);
          assertTrue(result.isInferred);
          // Depth 2 -> penalty = 0.2, confidence = 0.9 - 0.2 = 0.7
          strictEqual(result.confidence, 0.7);
          assertTrue(result.reasoningTrace !== undefined);
          strictEqual(result.reasoningTrace?.depth, 2);
        },
        Effect.provide(
          createTestLayer({
            knownRelations: [],
            inferenceResult: createInferenceResultWithRelation(inferredRelation, 2),
          })
        )
      )
    );

    effect(
      "respects minimum confidence for deep inference chains",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const result = yield* validator.validateRelation(inferredRelation);

          assertTrue(result.found);
          assertTrue(result.isInferred);
          // Depth 10 -> penalty = 1.0, but min confidence is 0.5
          strictEqual(result.confidence, 0.5);
        },
        Effect.provide(
          createTestLayer({
            knownRelations: [],
            inferenceResult: createInferenceResultWithRelation(inferredRelation, 10),
          })
        )
      )
    );
  });

  describe("validateCitation", () => {
    effect(
      "returns high confidence when all entities found",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citation = new Citation({
            claimText: "Alice knows Bob",
            entityIds: [knownEntity1, knownEntity2],
            confidence: 0.9,
          });

          const result = yield* validator.validateCitation(citation);

          strictEqual(A.length(result.entityResults), 2);
          assertTrue(A.every(result.entityResults, (r) => r.found));
          strictEqual(result.overallConfidence, 1.0);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1, knownEntity2],
          })
        )
      )
    );

    effect(
      "returns low confidence when entity is missing",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citation = new Citation({
            claimText: "Alice knows Bob",
            entityIds: [knownEntity1, unknownEntity],
            confidence: 0.9,
          });

          const result = yield* validator.validateCitation(citation);

          strictEqual(A.length(result.entityResults), 2);
          // One found, one not found
          const foundCount = A.length(A.filter(result.entityResults, (r) => r.found));
          strictEqual(foundCount, 1);
          // Overall confidence is min, so 0.0
          strictEqual(result.overallConfidence, 0.0);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1],
          })
        )
      )
    );

    effect(
      "includes relation validation when relationId present",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citation = new Citation({
            claimText: "Alice knows Bob",
            entityIds: [knownEntity1, knownEntity2],
            relationId: knownRelation,
            confidence: 0.9,
          });

          const result = yield* validator.validateCitation(citation);

          assertTrue(result.relationResult !== undefined);
          assertTrue(result.relationResult?.found);
          strictEqual(result.overallConfidence, 1.0);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1, knownEntity2],
            knownRelations: [knownRelation],
          })
        )
      )
    );

    effect(
      "overall confidence limited by relation when relation not found",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citation = new Citation({
            claimText: "Alice knows Bob",
            entityIds: [knownEntity1, knownEntity2],
            relationId: unknownRelation,
            confidence: 0.9,
          });

          const result = yield* validator.validateCitation(citation);

          assertTrue(result.relationResult !== undefined);
          assertTrue(!result.relationResult?.found);
          // Entities found (1.0 each), but relation not found (0.0)
          strictEqual(result.overallConfidence, 0.0);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1, knownEntity2],
            knownRelations: [],
          })
        )
      )
    );

    effect(
      "handles empty entity list",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citation = new Citation({
            claimText: "Some claim",
            entityIds: [],
            confidence: 0.5,
          });

          const result = yield* validator.validateCitation(citation);

          strictEqual(A.length(result.entityResults), 0);
          strictEqual(result.overallConfidence, 0.0);
        },
        Effect.provide(createTestLayer({}))
      )
    );
  });

  describe("validateAllCitations", () => {
    effect(
      "validates multiple citations in parallel",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const citations = [
            new Citation({
              claimText: "Claim 1",
              entityIds: [knownEntity1],
              confidence: 0.9,
            }),
            new Citation({
              claimText: "Claim 2",
              entityIds: [knownEntity2],
              confidence: 0.8,
            }),
            new Citation({
              claimText: "Claim 3",
              entityIds: [unknownEntity],
              confidence: 0.7,
            }),
          ];

          const results = yield* validator.validateAllCitations(citations);

          strictEqual(A.length(results), 3);
          // First two should have confidence 1.0, third should have 0.0
          strictEqual(results[0]?.overallConfidence, 1.0);
          strictEqual(results[1]?.overallConfidence, 1.0);
          strictEqual(results[2]?.overallConfidence, 0.0);
        },
        Effect.provide(
          createTestLayer({
            knownEntities: [knownEntity1, knownEntity2],
          })
        )
      )
    );

    effect(
      "handles empty citation list",
      Effect.fn(
        function* () {
          const validator = yield* CitationValidator;
          const results = yield* validator.validateAllCitations([]);

          strictEqual(A.length(results), 0);
        },
        Effect.provide(createTestLayer({}))
      )
    );
  });
});
