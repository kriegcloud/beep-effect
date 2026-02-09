import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence");

export class Model extends M.Class<Model>($I`RelationEvidenceModel`)(
  makeFields(KnowledgeEntityIds.RelationEvidenceId, {
    organizationId: SharedEntityIds.OrganizationId,

    relationId: KnowledgeEntityIds.RelationId.annotations({
      description: "Relation this evidence span supports",
    }),

    documentId: DocumentsEntityIds.DocumentId.annotations({
      description: "ID of the source document containing this evidence span",
    }),

    documentVersionId: DocumentsEntityIds.DocumentVersionId.annotations({
      description: "Version of the source document this evidence is pinned to (C-05)",
    }),

    startChar: S.NonNegativeInt.annotations({
      description: "Character offset start (0-indexed, UTF-16 code units)",
    }),

    endChar: S.NonNegativeInt.annotations({
      description: "Character offset end (exclusive, UTF-16 code units)",
    }),

    text: S.String.annotations({
      description: "Snippet text for display/debugging (server-truncated)",
    }),

    confidence: BS.FieldOptionOmittable(
      Confidence.annotations({
        description: "Extraction confidence score (0-1)",
      })
    ),

    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),
  }),
  $I.annotations("RelationEvidenceModel", {
    description: "Evidence-of-record span for a relation/claim (D-08).",
  })
) {
  static readonly utils = modelKit(Model);
}

