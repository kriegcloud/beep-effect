import {
  GenerationError,
  type GraphContext,
  GroundedAnswerGenerator,
  GroundedAnswerGeneratorLive,
} from "@beep/knowledge-server/GraphRAG/GroundedAnswerGenerator";
import { CentralRateLimiterService } from "@beep/knowledge-server/LlmControl/RateLimiter";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import {
  graphRagFixtureIds,
  makeGraphContext,
  makeGraphContextEntity,
  makeGraphContextRelation,
} from "../_shared/GraphFixtures";
import { withTextLanguageModel } from "../_shared/TestLayers";

const NoopRateLimiterLayer = Layer.succeed(
  CentralRateLimiterService,
  CentralRateLimiterService.of({
    acquire: () => Effect.void,
    release: () => Effect.void,
    getMetrics: () => Effect.die("not implemented in test"),
    getResetTime: () => Effect.succeed(0),
    setCircuitState: () => Effect.void,
  })
);

const TestGeneratorLayer = Layer.provide(GroundedAnswerGeneratorLive, NoopRateLimiterLayer);

const TEST_TIMEOUT = 60000;

const testEntityId1 = graphRagFixtureIds.entity1;
const testEntityId2 = graphRagFixtureIds.entity2;
const testRelationId = graphRagFixtureIds.relation1;

const testContext: GraphContext = makeGraphContext({
  entities: [
    makeGraphContextEntity({ id: testEntityId1, mention: "Alice", types: ["Person"] }),
    makeGraphContextEntity({ id: testEntityId2, mention: "Acme Corp", types: ["Organization"] }),
  ],
  relations: [
    makeGraphContextRelation({
      id: testRelationId,
      subjectId: testEntityId1,
      predicate: "worksFor",
      objectId: testEntityId2,
    }),
  ],
});

const mockResponseWithCitations = `Alice {{entity:${testEntityId1}}} works at Acme Corp {{entity:${testEntityId2}}} as shown by {{relation:${testRelationId}}}.`;

const mockResponseWithoutCitations = "I don't have enough information to answer this question.";

describe("GroundedAnswerGenerator", () => {
  describe("generate", () => {
    effect(
      "generates answer with citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;

          const answer = yield* generator.generate(testContext, "Where does Alice work?");

          assertTrue(Str.length(answer.text) > 0);
          assertTrue(!Str.includes("{{")(answer.text));

          assertTrue(A.length(answer.citations) > 0);

          strictEqual(answer.confidence, 1.0);
        },
        Effect.provide(TestGeneratorLayer),
        withTextLanguageModel(mockResponseWithCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "returns low confidence for no citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;

          const answer = yield* generator.generate(testContext, "What is quantum physics?");

          assertTrue(Str.length(answer.text) > 0);

          strictEqual(A.length(answer.citations), 0);
          strictEqual(answer.confidence, 0.0);
        },
        Effect.provide(TestGeneratorLayer),
        withTextLanguageModel(mockResponseWithoutCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "handles empty LLM response",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;

          const answer = yield* generator.generate(testContext, "Test?");

          assertTrue(Str.includes("don't have enough information")(answer.text));
          strictEqual(answer.confidence, 0.0);
        },
        Effect.provide(TestGeneratorLayer),
        withTextLanguageModel("")
      ),
      TEST_TIMEOUT
    );

    effect(
      "handles empty context",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;
          const emptyContext: GraphContext = makeGraphContext();

          const answer = yield* generator.generate(emptyContext, "Who is Alice?");

          assertTrue(Str.length(answer.text) > 0);
        },
        Effect.provide(TestGeneratorLayer),
        withTextLanguageModel(mockResponseWithoutCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "strips citation markers from output text",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;

          const answer = yield* generator.generate(testContext, "Where does Alice work?");

          assertTrue(!Str.includes("{{entity:")(answer.text));
          assertTrue(!Str.includes("{{relation:")(answer.text));
          assertTrue(!Str.includes("}}")(answer.text));
        },
        Effect.provide(TestGeneratorLayer),
        withTextLanguageModel(mockResponseWithCitations)
      ),
      TEST_TIMEOUT
    );

    effect(
      "includes entity IDs in citations",
      Effect.fn(
        function* () {
          const generator = yield* GroundedAnswerGenerator;

          const answer = yield* generator.generate(testContext, "Where does Alice work?");

          const allEntityIds = A.flatMap(answer.citations, (c) => c.entityIds);
          assertTrue(A.length(allEntityIds) > 0);
        },
        Effect.provide(TestGeneratorLayer),
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
