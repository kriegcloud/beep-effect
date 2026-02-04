/**
 * GroundedAnswerGenerator Tests
 *
 * Tests for grounded answer generation service with mocked LLM.
 *
 * @module knowledge-server/test/GraphRAG/GroundedAnswerGenerator.test
 * @since 0.1.0
 */

import {
  GenerationError,
  type GraphContext,
  GroundedAnswerGenerator,
} from "@beep/knowledge-server/GraphRAG/GroundedAnswerGenerator";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import { LanguageModel } from "@effect/ai";
import type * as Response from "@effect/ai/Response";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Stream from "effect/Stream";

const TEST_TIMEOUT = 60000;

// Test IDs
const testEntityId1 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__11111111-1111-1111-1111-111111111111"
);
const testEntityId2 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__22222222-2222-2222-2222-222222222222"
);
const testRelationId = KnowledgeEntityIds.RelationId.make("knowledge_relation__33333333-3333-3333-3333-333333333333");

// Test context
const createTestContext = (): GraphContext => ({
  entities: [
    { id: testEntityId1, mention: "Alice", types: ["Person"] },
    { id: testEntityId2, mention: "Acme Corp", types: ["Organization"] },
  ],
  relations: [{ id: testRelationId, subjectId: testEntityId1, predicate: "worksFor", objectId: testEntityId2 }],
});

// Mock LLM response with citations
const mockResponseWithCitations = `Alice {{entity:${testEntityId1}}} works at Acme Corp {{entity:${testEntityId2}}} as shown by {{relation:${testRelationId}}}.`;

// Mock LLM response without citations
const mockResponseWithoutCitations = "I don't have enough information to answer this question.";

// ---------------------------------------------------------------------------
// Text-based LanguageModel Mock (for generateText responses)
// ---------------------------------------------------------------------------

const defaultUsage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };

const buildTextResponse = (text: string): Array<Response.PartEncoded> => [
  { type: "text", text },
  {
    type: "finish",
    reason: "stop",
    usage: defaultUsage,
  },
];

/**
 * Provide a mock LanguageModel that returns specified text for generateText calls.
 *
 * Unlike withLanguageModel which is designed for generateObject, this returns
 * raw text responses for generators that use generateText.
 */
const withTextLanguageModel: {
  (
    text: string
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, text: string): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
} = dual(2, <A, E, R>(effect: Effect.Effect<A, E, R>, text: string) => {
  const makeService = LanguageModel.make({
    generateText: () => Effect.succeed(buildTextResponse(text)),
    streamText: () => Stream.empty,
  });

  return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService) as Effect.Effect<
    A,
    E,
    Exclude<R, LanguageModel.LanguageModel>
  >;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GroundedAnswerGenerator", () => {
  describe("generate", () => {
    effect(
      "generates answer with citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const context = createTestContext();

          const answer = yield* generator.generate(context, "Where does Alice work?");

          // Answer should have clean text (no citation markers)
          assertTrue(answer.text.length > 0);
          assertTrue(!answer.text.includes("{{"));

          // Should have parsed citations
          assertTrue(A.length(answer.citations) > 0);

          // Confidence should be 1.0 for Phase 2 (all citations start at 1.0)
          strictEqual(answer.confidence, 1.0);
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel(mockResponseWithCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "returns low confidence for no citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const context = createTestContext();

          const answer = yield* generator.generate(context, "What is quantum physics?");

          // Should have text
          assertTrue(answer.text.length > 0);

          // No citations = 0.0 confidence
          strictEqual(A.length(answer.citations), 0);
          strictEqual(answer.confidence, 0.0);
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel(mockResponseWithoutCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "handles empty LLM response",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const context = createTestContext();

          const answer = yield* generator.generate(context, "Test?");

          // Should return default "no information" response
          assertTrue(answer.text.includes("don't have enough information"));
          strictEqual(answer.confidence, 0.0);
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel("")
      ),
      TEST_TIMEOUT
    );

    effect(
      "handles empty context",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const emptyContext: GraphContext = { entities: [], relations: [] };

          const answer = yield* generator.generate(emptyContext, "Who is Alice?");

          // Should still produce an answer (LLM should say no info)
          assertTrue(answer.text.length > 0);
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel(mockResponseWithoutCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "strips citation markers from output text",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const context = createTestContext();

          const answer = yield* generator.generate(context, "Where does Alice work?");

          // Output text should not contain raw citation markers
          assertTrue(!answer.text.includes("{{entity:"));
          assertTrue(!answer.text.includes("{{relation:"));
          assertTrue(!answer.text.includes("}}"));
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel(mockResponseWithCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "includes entity IDs in citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const context = createTestContext();

          const answer = yield* generator.generate(context, "Where does Alice work?");

          // Citations should reference the test entity IDs
          const allEntityIds = A.flatMap(answer.citations, (c) => c.entityIds);
          assertTrue(A.length(allEntityIds) > 0);
        },
        Effect.provide(GroundedAnswerGenerator.Default),
        withTextLanguageModel(mockResponseWithCitations)
      ),
      TEST_TIMEOUT
    );
  });

  describe("GenerationError", () => {
    effect(
      "is tagged error",
      Effect.fn(function* () {
        const error = new GenerationError({ message: "Test error" });

        strictEqual(error._tag, "GenerationError");
        strictEqual(error.message, "Test error");
      })
    );

    effect(
      "includes cause when provided",
      Effect.fn(function* () {
        const cause = new Error("Original error");
        const error = new GenerationError({ message: "Wrapped error", cause });

        strictEqual(error.cause, cause);
      })
    );
  });
});
