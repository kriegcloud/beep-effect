import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MentionRecord");

export class Model extends M.Class<Model>($I`MentionRecordModel`)(
  makeFields(KnowledgeEntityIds.MentionRecordId, {
    organizationId: SharedEntityIds.OrganizationId,

    extractionId: KnowledgeEntityIds.ExtractionId.annotations({
      description: "ID of the extraction run that produced this mention",
    }),

    documentId: DocumentsEntityIds.DocumentId.annotations({
      description: "ID of the source document where this mention was extracted",
    }),

    chunkIndex: S.NonNegativeInt.annotations({
      description: "Index of the text chunk within the document (0-based)",
    }),

    rawText: S.NonEmptyString.annotations({
      description: "Exact text span extracted by the LLM",
    }),

    mentionType: S.String.annotations({
      description: "Ontology class URI (e.g., http://schema.org/Person)",
    }),

    confidence: S.Number.pipe(S.between(0, 1)).annotations({
      description: "LLM-reported confidence score for this mention",
    }),

    responseHash: S.String.annotations({
      description: "SHA256 hex digest of the raw LLM response for provenance",
    }),

    extractedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the LLM extraction occurred",
    }),

    resolvedEntityId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.KnowledgeEntityId.annotations({
        description: "Canonical entity ID after resolution (null if unresolved)",
      })
    ),
  }),
  $I.annotations("MentionRecordModel", {
    description: "Immutable mention extraction record preserving LLM output provenance for entity resolution.",
  })
) {
  static readonly utils = modelKit(Model);

  get isResolved(): boolean {
    return this.resolvedEntityId !== undefined;
  }
}
