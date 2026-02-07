import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("GraphRAG/AnswerSchemas");

export class InferenceStep extends S.Class<InferenceStep>($I`InferenceStep`)(
  {
    rule: S.NonEmptyString,
    premises: S.Array(S.String),
  },
  $I.annotations("InferenceStep", {
    description: "Single inference step used in the model's reasoning trace (rule + premise strings).",
  })
) {}

export class ReasoningTrace extends S.Class<ReasoningTrace>($I`ReasoningTrace`)(
  {
    inferenceSteps: S.Array(InferenceStep),
    depth: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
  },
  $I.annotations("ReasoningTrace", {
    description: "Structured reasoning trace containing inference steps and a maximum depth.",
  })
) {}

export class Citation extends S.Class<Citation>($I`Citation`)(
  {
    claimText: S.NonEmptyString,
    entityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    relationId: S.optional(KnowledgeEntityIds.RelationId),
    confidence: Confidence,
  },
  $I.annotations("Citation", {
    description: "Citation bundle for a claim (referenced entities, optional relation, and confidence).",
  })
) {}

export class GroundedAnswer extends S.Class<GroundedAnswer>($I`GroundedAnswer`)(
  {
    text: S.NonEmptyString,
    citations: S.Array(Citation),
    confidence: Confidence,
    reasoning: S.optional(ReasoningTrace),
  },
  $I.annotations("GroundedAnswer", {
    description: "Grounded answer text with citations, overall confidence, and optional reasoning trace.",
  })
) {}
