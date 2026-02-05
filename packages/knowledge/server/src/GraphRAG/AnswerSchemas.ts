import { Confidence } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

export class InferenceStep extends S.Class<InferenceStep>("InferenceStep")({
  rule: S.NonEmptyString,
  premises: S.Array(S.String),
}) {}

export class ReasoningTrace extends S.Class<ReasoningTrace>("ReasoningTrace")({
  inferenceSteps: S.Array(InferenceStep),
  depth: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
}) {}

export class Citation extends S.Class<Citation>("Citation")({
  claimText: S.NonEmptyString,
  entityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  relationId: S.optional(KnowledgeEntityIds.RelationId),
  confidence: Confidence,
}) {}

export class GroundedAnswer extends S.Class<GroundedAnswer>("GroundedAnswer")({
  text: S.NonEmptyString,
  citations: S.Array(Citation),
  confidence: Confidence,
  reasoning: S.optional(ReasoningTrace),
}) {}
