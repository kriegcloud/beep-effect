import { Citation, GroundedAnswer, InferenceStep, ReasoningTrace } from "@beep/knowledge-server/GraphRAG/AnswerSchemas";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { graphRagFixtureIds } from "../_shared/GraphFixtures";

const testEntityId1 = graphRagFixtureIds.entity1;
const testEntityId2 = graphRagFixtureIds.entity2;
const testRelationId = graphRagFixtureIds.relation1;

describe("AnswerSchemas", () => {
  describe("InferenceStep", () => {
    effect("validates valid inference step", () =>
      Effect.gen(function* () {
        const step = yield* S.decode(InferenceStep)({
          rule: "sameAs transitivity",
          premises: ["Alice", "Alice_LinkedIn"],
        });

        strictEqual(step.rule, "sameAs transitivity");
        strictEqual(A.length(step.premises), 2);
        const first = A.head(step.premises);
        assertTrue(O.isSome(first));
        strictEqual(O.getOrThrow(first), "Alice");
      })
    );

    effect("rejects empty rule", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(InferenceStep)({
          rule: "",
          premises: ["Alice"],
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("allows empty premises array", () =>
      Effect.gen(function* () {
        const step = yield* S.decode(InferenceStep)({
          rule: "base fact",
          premises: [],
        });

        strictEqual(A.length(step.premises), 0);
      })
    );
  });

  describe("ReasoningTrace", () => {
    effect("validates valid reasoning trace", () =>
      Effect.gen(function* () {
        const trace = yield* S.decode(ReasoningTrace)({
          inferenceSteps: [
            { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
            { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
          ],
          depth: 2,
        });

        strictEqual(A.length(trace.inferenceSteps), 2);
        strictEqual(trace.depth, 2);
      })
    );

    effect("rejects depth less than 1", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(ReasoningTrace)({
          inferenceSteps: [{ rule: "test", premises: [] }],
          depth: 0,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects negative depth", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(ReasoningTrace)({
          inferenceSteps: [{ rule: "test", premises: [] }],
          depth: -1,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects non-integer depth", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(ReasoningTrace)({
          inferenceSteps: [{ rule: "test", premises: [] }],
          depth: 1.5,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("allows empty inference steps with depth 1", () =>
      Effect.gen(function* () {
        const trace = yield* S.decode(ReasoningTrace)({
          inferenceSteps: [],
          depth: 1,
        });

        strictEqual(A.length(trace.inferenceSteps), 0);
        strictEqual(trace.depth, 1);
      })
    );
  });

  describe("Citation", () => {
    effect("validates valid citation with relation", () =>
      Effect.gen(function* () {
        const citation = yield* S.decode(Citation)({
          claimText: "Alice knows Bob",
          entityIds: [testEntityId1, testEntityId2],
          relationId: testRelationId,
          confidence: 0.95,
        });

        strictEqual(citation.claimText, "Alice knows Bob");
        strictEqual(A.length(citation.entityIds), 2);
        assertTrue(O.isSome(O.fromNullable(citation.relationId)));
        strictEqual(citation.confidence, 0.95);
      })
    );

    effect("validates citation without relation", () =>
      Effect.gen(function* () {
        const citation = yield* S.decode(Citation)({
          claimText: "Alice is a person",
          entityIds: [testEntityId1],
          confidence: 1.0,
        });

        strictEqual(A.length(citation.entityIds), 1);
        assertTrue(citation.relationId === undefined);
      })
    );

    effect("rejects empty claim text", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(Citation)({
          claimText: "",
          entityIds: [testEntityId1],
          confidence: 0.8,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects confidence below 0", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(Citation)({
          claimText: "test claim",
          entityIds: [testEntityId1],
          confidence: -0.1,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects confidence above 1", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(Citation)({
          claimText: "test claim",
          entityIds: [testEntityId1],
          confidence: 1.1,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("accepts boundary confidence values", () =>
      Effect.gen(function* () {
        const citation0 = yield* S.decode(Citation)({
          claimText: "low confidence claim",
          entityIds: [testEntityId1],
          confidence: 0,
        });
        strictEqual(citation0.confidence, 0);

        const citation1 = yield* S.decode(Citation)({
          claimText: "high confidence claim",
          entityIds: [testEntityId1],
          confidence: 1,
        });
        strictEqual(citation1.confidence, 1);
      })
    );

    effect("allows empty entity IDs array", () =>
      Effect.gen(function* () {
        const citation = yield* S.decode(Citation)({
          claimText: "ungrounded claim",
          entityIds: [],
          confidence: 0.1,
        });

        strictEqual(A.length(citation.entityIds), 0);
      })
    );
  });

  describe("GroundedAnswer", () => {
    effect("validates complete grounded answer with reasoning", () =>
      Effect.gen(function* () {
        const answer = yield* S.decode(GroundedAnswer)({
          text: "Alice knows Bob through their LinkedIn connection.",
          citations: [
            {
              claimText: "Alice knows Bob",
              entityIds: [testEntityId1, testEntityId2],
              relationId: testRelationId,
              confidence: 0.85,
            },
          ],
          confidence: 0.85,
          reasoning: {
            inferenceSteps: [
              { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
              { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
            ],
            depth: 2,
          },
        });

        strictEqual(answer.text, "Alice knows Bob through their LinkedIn connection.");
        strictEqual(A.length(answer.citations), 1);
        strictEqual(answer.confidence, 0.85);
        assertTrue(answer.reasoning !== undefined);
        strictEqual(answer.reasoning?.depth, 2);
      })
    );

    effect("validates grounded answer without reasoning", () =>
      Effect.gen(function* () {
        const answer = yield* S.decode(GroundedAnswer)({
          text: "Alice is a software engineer.",
          citations: [
            {
              claimText: "Alice is a software engineer",
              entityIds: [testEntityId1],
              confidence: 1.0,
            },
          ],
          confidence: 1.0,
        });

        strictEqual(answer.reasoning, undefined);
      })
    );

    effect("rejects empty answer text", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(GroundedAnswer)({
          text: "",
          citations: [],
          confidence: 0.5,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects answer confidence below 0", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(GroundedAnswer)({
          text: "Some answer",
          citations: [],
          confidence: -0.5,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("rejects answer confidence above 1", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(GroundedAnswer)({
          text: "Some answer",
          citations: [],
          confidence: 1.5,
        }).pipe(Effect.either);

        assertTrue(result._tag === "Left");
      })
    );

    effect("allows answer with empty citations", () =>
      Effect.gen(function* () {
        const answer = yield* S.decode(GroundedAnswer)({
          text: "I don't have information about that.",
          citations: [],
          confidence: 0.0,
        });

        strictEqual(A.length(answer.citations), 0);
        strictEqual(answer.confidence, 0.0);
      })
    );

    effect("validates answer with multiple citations", () =>
      Effect.gen(function* () {
        const answer = yield* S.decode(GroundedAnswer)({
          text: "Alice knows Bob and works at Acme Corp.",
          citations: [
            {
              claimText: "Alice knows Bob",
              entityIds: [testEntityId1, testEntityId2],
              confidence: 0.9,
            },
            {
              claimText: "Alice works at Acme Corp",
              entityIds: [testEntityId1],
              confidence: 0.95,
            },
          ],
          confidence: 0.92,
        });

        strictEqual(A.length(answer.citations), 2);
      })
    );
  });
});
