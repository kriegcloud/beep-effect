/**
 * MentionRecord domain model for Knowledge slice
 *
 * Represents an immutable mention extraction record preserving LLM output provenance.
 * MentionRecords serve as the evidence layer for entity resolution, storing raw
 * extraction data with full audit trails.
 *
 * @module knowledge-domain/entities/MentionRecord
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MentionRecord");

/**
 * MentionRecord model for the knowledge slice.
 *
 * Represents an immutable extraction record from an LLM extraction run.
 * MentionRecords preserve the raw output from entity extraction, including
 * provenance metadata, confidence scores, and text spans.
 *
 * **Immutability**: All fields are immutable except `resolvedEntityId`, which
 * links to the resolved entity after clustering/resolution.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const mentionRecord = Entities.MentionRecord.Model.insert.make({
 *   id: KnowledgeEntityIds.MentionRecordId.make("knowledge_mention_record__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   extractionId: KnowledgeEntityIds.ExtractionId.make("knowledge_extraction__uuid"),
 *   documentId: DocumentsEntityIds.DocumentId.make("documents_document__uuid"),
 *   rawText: "Cristiano Ronaldo",
 *   mentionType: "http://schema.org/Person",
 *   chunkIndex: 0,
 *   confidence: 0.95,
 *   responseHash: "sha256:abc123...",
 *   extractedAt: DateTime.unsafeNow(),
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`MentionRecordModel`)(
  makeFields(KnowledgeEntityIds.MentionRecordId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Extraction run that produced this mention
     */
    extractionId: KnowledgeEntityIds.ExtractionId.annotations({
      description: "ID of the extraction run that produced this mention",
    }),

    /**
     * Source document ID for provenance tracking
     */
    documentId: S.String.annotations({
      description: "ID of the source document where this mention was extracted",
    }),

    /**
     * Chunk index within the document
     */
    chunkIndex: S.NonNegativeInt.annotations({
      description: "Index of the text chunk within the document (0-based)",
    }),

    /**
     * Raw extracted text from LLM
     */
    rawText: S.NonEmptyString.annotations({
      description: "Exact text span extracted by the LLM",
    }),

    /**
     * Ontology type URI for this mention
     */
    mentionType: S.String.annotations({
      description: "Ontology class URI (e.g., http://schema.org/Person)",
    }),

    /**
     * LLM confidence score (0-1)
     */
    confidence: S.Number.pipe(S.between(0, 1)).annotations({
      description: "LLM-reported confidence score for this mention",
    }),

    /**
     * SHA256 hash of the LLM response for audit trails
     */
    responseHash: S.String.annotations({
      description: "SHA256 hex digest of the raw LLM response for provenance",
    }),

    /**
     * When the mention was extracted by the LLM
     */
    extractedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the LLM extraction occurred",
    }),

    /**
     * Resolved entity ID after clustering/resolution
     *
     * **Mutable Field**: This is the ONLY mutable field in MentionRecord.
     * Updated when entity resolution links this mention to a canonical entity.
     */
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

  /**
   * Check if this mention has been resolved to an entity
   */
  get isResolved(): boolean {
    return this.resolvedEntityId !== undefined;
  }
}
