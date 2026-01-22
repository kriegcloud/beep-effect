/**
 * Extraction domain model for Knowledge slice
 *
 * Represents a knowledge extraction run from a document.
 *
 * @module knowledge-domain/entities/Extraction
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Extraction");

/**
 * Extraction status enum
 *
 * @since 0.1.0
 * @category schemas
 */
export class ExtractionStatus extends BS.StringLiteralKit(
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
).annotations({
  identifier: "ExtractionStatus",
  description: "Status of the extraction run",
}) {}

export declare namespace ExtractionStatus {
  export type Type = typeof ExtractionStatus.Type;
}

/**
 * Extraction model for the knowledge slice.
 *
 * Represents a knowledge extraction run from a document.
 * Tracks status, statistics, and links to extracted entities/relations.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const extraction = Entities.Extraction.Model.insert.make({
 *   id: KnowledgeEntityIds.ExtractionId.make("knowledge_extraction__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   documentId: "doc-123",
 *   ontologyId: KnowledgeEntityIds.OntologyId.make("knowledge_ontology__uuid"),
 *   status: "pending",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`ExtractionModel`)(
  makeFields(KnowledgeEntityIds.ExtractionId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Source document ID
     */
    documentId: S.String.annotations({
      description: "ID of the source document being extracted",
    }),

    /**
     * Source document URI
     */
    sourceUri: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Storage URI of the source document",
      })
    ),

    /**
     * Ontology used for extraction
     */
    ontologyId: KnowledgeEntityIds.OntologyId.annotations({
      description: "ID of the ontology used for extraction",
    }),

    /**
     * Extraction status
     */
    status: BS.toOptionalWithDefault(ExtractionStatus)("pending").annotations({
      description: "Current status of the extraction run",
    }),

    /**
     * When extraction started
     */
    startedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),

    /**
     * When extraction completed (or failed)
     */
    completedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),

    /**
     * Number of entities extracted
     */
    entityCount: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.int(),
        S.nonNegative(),
        S.annotations({
          description: "Number of entities extracted",
        })
      )
    ),

    /**
     * Number of relations extracted
     */
    relationCount: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.int(),
        S.nonNegative(),
        S.annotations({
          description: "Number of relations extracted",
        })
      )
    ),

    /**
     * Number of chunks processed
     */
    chunkCount: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.int(),
        S.nonNegative(),
        S.annotations({
          description: "Number of text chunks processed",
        })
      )
    ),

    /**
     * Total tokens consumed by LLM
     */
    totalTokens: BS.FieldOptionOmittable(
      S.Number.pipe(
        S.int(),
        S.nonNegative(),
        S.annotations({
          description: "Total LLM tokens consumed",
        })
      )
    ),

    /**
     * Error message if extraction failed
     */
    errorMessage: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Error message if extraction failed",
      })
    ),

    /**
     * Extraction configuration used
     */
    config: BS.FieldOptionOmittable(
      S.Record({ key: S.String, value: S.Unknown }).annotations({
        description: "Extraction configuration parameters",
      })
    ),
  }),
  $I.annotations("ExtractionModel", {
    description: "Knowledge extraction run record with status and statistics.",
  })
) {
  static readonly utils = modelKit(Model);

  /**
   * Check if extraction is complete
   */
  get isComplete(): boolean {
    return this.status === "completed" || this.status === "failed" || this.status === "cancelled";
  }

  /**
   * Check if extraction is running
   */
  get isRunning(): boolean {
    return this.status === "running";
  }
}
