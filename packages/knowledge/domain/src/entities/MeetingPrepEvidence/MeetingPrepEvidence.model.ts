import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence");

export class SourceType extends BS.StringLiteralKit("mention", "relation", "document_span").annotations(
  $I.annotations("MeetingPrepEvidenceSourceType", {
    description: "Evidence source discriminator for meeting-prep citations.",
  })
) {}

export declare namespace SourceType {
  export type Type = typeof SourceType.Type;
}

export class Model extends M.Class<Model>($I`MeetingPrepEvidenceModel`)(
  makeFields(KnowledgeEntityIds.MeetingPrepEvidenceId, {
    organizationId: SharedEntityIds.OrganizationId,

    bulletId: KnowledgeEntityIds.MeetingPrepBulletId.annotations({
      description: "FK to the persisted meeting-prep bullet output",
    }),

    sourceType: SourceType,

    mentionId: BS.FieldOptionOmittable(KnowledgeEntityIds.MentionId),
    relationEvidenceId: BS.FieldOptionOmittable(KnowledgeEntityIds.RelationEvidenceId),

    documentId: BS.FieldOptionOmittable(WorkspacesEntityIds.DocumentId),
    documentVersionId: BS.FieldOptionOmittable(WorkspacesEntityIds.DocumentVersionId),
    startChar: BS.FieldOptionOmittable(S.NonNegativeInt),
    endChar: BS.FieldOptionOmittable(S.NonNegativeInt),
    text: BS.FieldOptionOmittable(S.String),

    confidence: BS.FieldOptionOmittable(Confidence),
    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),
  }),
  $I.annotations("MeetingPrepEvidenceModel", {
    description: "Persisted meeting-prep citation row resolving to version-pinned spans (C-05).",
  })
) {
  static readonly utils = modelKit(Model);
}
