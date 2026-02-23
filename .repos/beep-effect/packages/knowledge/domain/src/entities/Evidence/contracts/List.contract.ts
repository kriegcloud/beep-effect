import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Evidence/contracts/List.contract");

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

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "list",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "List evidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("List", "/list").setPayload(Payload).addSuccess(Success);
}
