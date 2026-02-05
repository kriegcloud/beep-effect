import { Citation, InferenceStep, ReasoningTrace } from "@beep/knowledge-server/GraphRAG/AnswerSchemas";
import {
  type CitationValidationResult,
  ConfidenceScorer,
  ConfidenceScorerLive,
  DEPTH_PENALTY_FACTOR,
  type EntityValidationResult,
  EXCLUDE_THRESHOLD,
  GROUNDED_THRESHOLD,
  MIN_PENALTY_MULTIPLIER,
  type RelationValidationResult,
} from "@beep/knowledge-server/GraphRAG/ConfidenceScorer";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

const testEntityId1 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__11111111-1111-1111-1111-111111111111"
);
const testEntityId2 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__22222222-2222-2222-2222-222222222222"
);
const testRelationId = KnowledgeEntityIds.RelationId.make("knowledge_relation__33333333-3333-3333-3333-333333333333");

const createCitation = (
  claimText: string,
  entityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type> = []
): Citation =>
  new Citation({
    claimText: claimText,
    entityIds: [...entityIds],
    confidence: 1.0,
  });

const createEntityResult = (
  entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
  found: boolean
): EntityValidationResult => ({
  entityId: entityId as string,
  found,
  confidence: found ? 1.0 : 0.0,
});

const createDirectRelationResult = (
  relationId: KnowledgeEntityIds.RelationId.Type,
  found: boolean
): RelationValidationResult => ({
  relationId: relationId as string,
  found,
  isInferred: false,
  confidence: found ? 1.0 : 0.0,
});

const createInferredRelationResult = (
  relationId: KnowledgeEntityIds.RelationId.Type,
  depth: number,
  confidence: number
): RelationValidationResult => ({
  relationId: relationId as string,
  found: true,
  isInferred: true,
  confidence,
  reasoningTrace: new ReasoningTrace({
    inferenceSteps: [
      new InferenceStep({
        rule: "test-rule",
        premises: ["premise1"],
      }),
    ],
    depth,
  }),
});

const createValidationResult = (config: {
  citation: Citation;
  entityResults: ReadonlyArray<EntityValidationResult>;
  relationResult?: RelationValidationResult;
  overallConfidence: number;
}): CitationValidationResult => ({
  citation: config.citation,
  entityResults: config.entityResults,
  relationResult: config.relationResult,
  overallConfidence: config.overallConfidence,
});

describe("ConfidenceScorer", () => {
  describe("applyDepthPenalty", () => {
    effect(
      "returns baseConfidence unchanged for depth 0",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.applyDepthPenalty(1.0, 0);

        strictEqual(result, 1.0);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "reduces confidence by 10% for depth 1",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.applyDepthPenalty(1.0, 1);

        strictEqual(result, 0.9);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "reduces confidence by 20% for depth 2",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.applyDepthPenalty(1.0, 2);

        strictEqual(result, 0.8);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "caps penalty at 50% reduction for depth 5+",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result5 = scorer.applyDepthPenalty(1.0, 5);
        const result10 = scorer.applyDepthPenalty(1.0, 10);

        strictEqual(result5, 0.5);
        strictEqual(result10, 0.5);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "applies penalty to non-1.0 base confidence",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.applyDepthPenalty(0.8, 2);

        assertTrue(result - 0.64 < 0.0001 && result - 0.64 > -0.0001);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "clamps result to [0.0, 1.0]",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const resultLow = scorer.applyDepthPenalty(-0.5, 0);
        strictEqual(resultLow, 0.0);

        const resultHigh = scorer.applyDepthPenalty(1.5, 0);
        strictEqual(resultHigh, 1.0);
      }, Effect.provide(ConfidenceScorerLive))
    );
  });

  describe("scoreCitation", () => {
    effect(
      "returns confidence 0.0 when entity not found",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Alice knows Bob", [testEntityId1]);
        const validationResult = createValidationResult({
          citation,
          entityResults: [createEntityResult(testEntityId1, false)],
          overallConfidence: 0.0,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 0.0);
        assertTrue(!scored.isGrounded);
        assertTrue(scored.shouldExclude);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "returns confidence 1.0 for all found with direct relation",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Alice knows Bob", [testEntityId1, testEntityId2]);
        const validationResult = createValidationResult({
          citation,
          entityResults: [createEntityResult(testEntityId1, true), createEntityResult(testEntityId2, true)],
          relationResult: createDirectRelationResult(testRelationId, true),
          overallConfidence: 1.0,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 1.0);
        assertTrue(scored.isGrounded);
        assertTrue(!scored.shouldExclude);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "applies depth penalty for inferred relation",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Alice knows Bob", [testEntityId1, testEntityId2]);
        const validationResult = createValidationResult({
          citation,
          entityResults: [createEntityResult(testEntityId1, true), createEntityResult(testEntityId2, true)],
          relationResult: createInferredRelationResult(testRelationId, 2, 0.8),
          overallConfidence: 0.8,
        });

        const scored = scorer.scoreCitation(validationResult);

        assertTrue(scored.finalConfidence - 0.64 < 0.0001 && scored.finalConfidence - 0.64 > -0.0001);
        assertTrue(scored.isGrounded);
        assertTrue(!scored.shouldExclude);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "isGrounded is true when confidence >= 0.5",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Test claim", [testEntityId1]);

        const validationResult = createValidationResult({
          citation,
          entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 0.5 }],
          overallConfidence: 0.5,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 0.5);
        assertTrue(scored.isGrounded);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "isGrounded is false when confidence < 0.5",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Test claim", [testEntityId1]);

        const validationResult = createValidationResult({
          citation,
          entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 0.49 }],
          overallConfidence: 0.49,
        });

        const scored = scorer.scoreCitation(validationResult);

        assertTrue(scored.finalConfidence < 0.5);
        assertTrue(!scored.isGrounded);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "shouldExclude is true when confidence < 0.3",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Test claim", [testEntityId1]);

        const validationResult = createValidationResult({
          citation,
          entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 0.29 }],
          overallConfidence: 0.29,
        });

        const scored = scorer.scoreCitation(validationResult);

        assertTrue(scored.finalConfidence < 0.3);
        assertTrue(scored.shouldExclude);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "shouldExclude is false when confidence >= 0.3",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Test claim", [testEntityId1]);

        const validationResult = createValidationResult({
          citation,
          entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 0.3 }],
          overallConfidence: 0.3,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 0.3);
        assertTrue(!scored.shouldExclude);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "takes minimum of entity and relation confidence",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("Test", [testEntityId1]);

        const validationResult = createValidationResult({
          citation,
          entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 1.0 }],
          relationResult: {
            relationId: testRelationId as string,
            found: true,
            isInferred: false,
            confidence: 0.4,
          },
          overallConfidence: 0.4,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 0.4);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "handles citation with no entities",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const citation = createCitation("No entities here");

        const validationResult = createValidationResult({
          citation,
          entityResults: [],
          overallConfidence: 1.0,
        });

        const scored = scorer.scoreCitation(validationResult);

        strictEqual(scored.finalConfidence, 1.0);
      }, Effect.provide(ConfidenceScorerLive))
    );
  });

  describe("scoreAnswer", () => {
    effect(
      "computes weighted average by claim text length",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const shortCitation = createCitation("Short text", [testEntityId1]);
        const longCitation = createCitation("This is a longer text", [testEntityId2]);

        const validationResults: ReadonlyArray<CitationValidationResult> = [
          createValidationResult({
            citation: shortCitation,
            entityResults: [{ entityId: testEntityId1 as string, found: true, confidence: 1.0 }],
            overallConfidence: 1.0,
          }),
          createValidationResult({
            citation: longCitation,
            entityResults: [{ entityId: testEntityId2 as string, found: true, confidence: 0.5 }],
            overallConfidence: 0.5,
          }),
        ];

        const scored = scorer.scoreAnswer("Full answer text", validationResults);

        assertTrue(scored.overallConfidence > 0.6);
        assertTrue(scored.overallConfidence < 0.7);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "computes groundedRatio correctly",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const citation1 = createCitation("Claim 1", [testEntityId1]);
        const citation2 = createCitation("Claim 2", [testEntityId1]);
        const citation3 = createCitation("Claim 3", [testEntityId1]);

        const validationResults: ReadonlyArray<CitationValidationResult> = [
          createValidationResult({
            citation: citation1,
            entityResults: [createEntityResult(testEntityId1, true)],
            overallConfidence: 1.0,
          }),
          createValidationResult({
            citation: citation2,
            entityResults: [createEntityResult(testEntityId1, true)],
            overallConfidence: 0.6,
          }),
          createValidationResult({
            citation: citation3,
            entityResults: [createEntityResult(testEntityId1, false)],
            overallConfidence: 0.0,
          }),
        ];

        const scored = scorer.scoreAnswer("Answer text", validationResults);

        strictEqual(scored.groundedRatio, 2 / 3);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "returns 0 groundedRatio for all ungrounded citations",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const citation1 = createCitation("Bad claim", [testEntityId1]);
        const citation2 = createCitation("Another bad", [testEntityId2]);

        const validationResults: ReadonlyArray<CitationValidationResult> = [
          createValidationResult({
            citation: citation1,
            entityResults: [createEntityResult(testEntityId1, false)],
            overallConfidence: 0.0,
          }),
          createValidationResult({
            citation: citation2,
            entityResults: [createEntityResult(testEntityId2, false)],
            overallConfidence: 0.2,
          }),
        ];

        const scored = scorer.scoreAnswer("Answer", validationResults);

        strictEqual(scored.groundedRatio, 0);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "handles empty validation results",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const scored = scorer.scoreAnswer("Answer with no citations", []);

        strictEqual(scored.overallConfidence, 0);
        strictEqual(scored.groundedRatio, 0);
        strictEqual(A.length(scored.citations), 0);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "includes all scored citations in result",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const citation1 = createCitation("Claim 1", [testEntityId1]);
        const citation2 = createCitation("Claim 2", [testEntityId2]);

        const validationResults: ReadonlyArray<CitationValidationResult> = [
          createValidationResult({
            citation: citation1,
            entityResults: [createEntityResult(testEntityId1, true)],
            overallConfidence: 1.0,
          }),
          createValidationResult({
            citation: citation2,
            entityResults: [createEntityResult(testEntityId2, true)],
            overallConfidence: 0.8,
          }),
        ];

        const scored = scorer.scoreAnswer("Answer", validationResults);

        strictEqual(A.length(scored.citations), 2);
        strictEqual(scored.text, "Answer");
      }, Effect.provide(ConfidenceScorerLive))
    );
  });

  describe("weightedAverage", () => {
    effect(
      "returns 0 for empty array",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.weightedAverage([]);

        strictEqual(result, 0);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "returns 0 when all weights are 0",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.weightedAverage([
          { value: 1.0, weight: 0 },
          { value: 0.5, weight: 0 },
        ]);

        strictEqual(result, 0);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "computes simple average when weights are equal",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.weightedAverage([
          { value: 1.0, weight: 1 },
          { value: 0.5, weight: 1 },
        ]);

        strictEqual(result, 0.75);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "weights higher values more when weight is higher",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.weightedAverage([
          { value: 1.0, weight: 3 },
          { value: 0.0, weight: 1 },
        ]);

        strictEqual(result, 0.75);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "handles single value",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;
        const result = scorer.weightedAverage([{ value: 0.7, weight: 10 }]);

        strictEqual(result, 0.7);
      }, Effect.provide(ConfidenceScorerLive))
    );

    effect(
      "clamps result to valid confidence range",
      Effect.fn(function* () {
        const scorer = yield* ConfidenceScorer;

        const result = scorer.weightedAverage([{ value: 1.5, weight: 1 }]);

        strictEqual(result, 1.0);
      }, Effect.provide(ConfidenceScorerLive))
    );
  });

  describe("constants", () => {
    effect(
      "exports correct threshold values",
      Effect.fn(function* () {
        strictEqual(GROUNDED_THRESHOLD, 0.5);
        strictEqual(EXCLUDE_THRESHOLD, 0.3);
        strictEqual(DEPTH_PENALTY_FACTOR, 0.1);
        strictEqual(MIN_PENALTY_MULTIPLIER, 0.5);
      })
    );
  });
});
