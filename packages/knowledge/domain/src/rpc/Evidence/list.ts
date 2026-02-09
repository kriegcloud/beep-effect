import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Evidence/List");

/**
 * Evidence.List canonical response item (C-02 / C-05).
 *
 * Offsets are JS UTF-16 indices, 0-indexed, end-exclusive: [startChar, endChar).
 * Evidence is pinned to a specific immutable document version (documentVersionId).
 */
export class EvidenceItem extends S.Class<EvidenceItem>($I`EvidenceItem`)(
  {
    documentId: S.String,
    documentVersionId: S.String,
    startChar: S.NonNegativeInt,
    endChar: S.NonNegativeInt,
    text: S.String,
    confidence: S.optional(S.Number),
    kind: S.Literal("mention", "relation", "bullet"),
    source: S.Struct({
      mentionId: S.optional(KnowledgeEntityIds.MentionId),
      relationEvidenceId: S.optional(KnowledgeEntityIds.RelationEvidenceId),
      meetingPrepBulletId: S.optional(KnowledgeEntityIds.MeetingPrepBulletId),
      extractionId: S.optional(KnowledgeEntityIds.ExtractionId),
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    }),
  },
  $I.annotations("EvidenceItem", {
    description: "Evidence.List response item (C-02).",
  })
) {}

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    relationId: S.optional(KnowledgeEntityIds.RelationId),
    meetingPrepBulletId: S.optional(KnowledgeEntityIds.MeetingPrepBulletId),
    documentId: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "Evidence.List filters (one-of entityId | relationId | meetingPrepBulletId | documentId).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    items: S.Array(EvidenceItem),
  },
  $I.annotations("Success", {
    description: "Evidence.List response wrapper (stable array ordering).",
  })
) {}

export const Error = S.Never;

export const Contract = Rpc.make("list", {
  payload: Payload,
  success: Success,
  error: Error,
});

