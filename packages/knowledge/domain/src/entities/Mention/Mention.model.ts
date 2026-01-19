/**
 * Mention domain model for Knowledge slice
 *
 * Represents an individual mention of an entity in source text
 * with provenance tracking (character offsets, confidence, etc.).
 *
 * @module knowledge-domain/entities/Mention
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Mention");

/**
 * Mention model for the knowledge slice.
 *
 * Represents an individual mention of an entity in source text.
 * Multiple mentions can reference the same entity (coreference resolution).
 * Tracks exact text, character offsets, and extraction confidence.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const mention = Entities.Mention.Model.insert.make({
 *   id: KnowledgeEntityIds.MentionId.make("knowledge_mention__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   entityId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__uuid"),
 *   text: "Cristiano Ronaldo",
 *   startChar: 42,
 *   endChar: 59,
 *   documentId: "doc-123",
 *   confidence: 0.95,
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`MentionModel`)(
  makeFields(KnowledgeEntityIds.MentionId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Entity ID this mention refers to
     */
    entityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "Entity this mention refers to",
    }),

    /**
     * Exact text span from source document
     */
    text: S.String.annotations({
      description: "Exact text span from source document",
    }),

    /**
     * Character offset start (0-indexed)
     */
    startChar: S.Number.pipe(
      S.int(),
      S.nonNegative(),
      S.annotations({
        description: "Character offset start (0-indexed)",
      })
    ),

    /**
     * Character offset end (exclusive)
     */
    endChar: S.Number.pipe(
      S.int(),
      S.nonNegative(),
      S.annotations({
        description: "Character offset end (exclusive)",
      })
    ),

    /**
     * Source document ID
     */
    documentId: S.String.annotations({
      description: "ID of the source document containing this mention",
    }),

    /**
     * Chunk index within the document
     */
    chunkIndex: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.int(),
        S.nonNegative(),
        S.annotations({
          description: "Chunk index within the document",
        })
      )
    ),

    /**
     * Extraction run ID that created this mention
     */
    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),

    /**
     * Extraction confidence (0-1)
     */
    confidence: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.greaterThanOrEqualTo(0),
        S.lessThanOrEqualTo(1),
        S.annotations({
          description: "Extraction confidence score (0-1)",
        })
      )
    ),

    /**
     * Whether this is a primary mention (first/canonical reference)
     */
    isPrimary: BS.BoolWithDefault(false).annotations({
      description: "Whether this is the primary/canonical mention of the entity",
    }),

    /**
     * Surrounding context text for disambiguation
     */
    context: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Surrounding context text for disambiguation",
      })
    ),
  }),
  $I.annotations("MentionModel", {
    description: "Individual entity mention in source text with character-level provenance.",
  })
) {
  static readonly utils = modelKit(Model);
}
