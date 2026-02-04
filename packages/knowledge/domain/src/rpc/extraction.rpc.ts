/**
 * Extraction RPC contracts for Knowledge slice
 *
 * RPC definitions for knowledge extraction operations.
 *
 * @module knowledge-domain/rpc/extraction
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Extraction } from "../entities";
import { ExtractionError } from "../errors";

const $I = $KnowledgeDomainId.create("rpc/extraction");

/**
 * Extraction request configuration
 *
 * @since 0.1.0
 * @category schemas
 */
export const ExtractionConfig = S.Struct({
  chunkSize: S.optional(S.Int.pipe(S.positive())),
  chunkOverlap: S.optional(S.NonNegativeInt),
  maxChunks: S.optional(S.Int.pipe(S.positive())),
  enableGrounding: S.optional(S.Boolean),
}).annotations(
  $I.annotations("ExtractionConfig", {
    description: "Configuration for extraction operations",
  })
);

/**
 * RPC contract for Knowledge Extraction operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 0.1.0
 * @category rpc
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Extract - Start knowledge extraction from a document.
   *
   * Creates an extraction run and begins processing the document
   * with the specified ontology.
   */
  Rpc.make("extract", {
    payload: {
      documentId: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: KnowledgeEntityIds.OntologyId,
      sourceUri: S.optional(S.String),
      config: S.optional(ExtractionConfig),
    },
    success: Extraction.Model.json,
    error: ExtractionError,
  }),

  /**
   * Get Status - Get the current status of an extraction run.
   */
  Rpc.make("getStatus", {
    payload: {
      id: KnowledgeEntityIds.ExtractionId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Extraction.Model.json,
    error: ExtractionError,
  }),

  /**
   * Cancel - Cancel a running extraction.
   */
  Rpc.make("cancel", {
    payload: {
      id: KnowledgeEntityIds.ExtractionId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Extraction.Model.json,
    error: ExtractionError,
  }),

  /**
   * List - List extraction runs for an organization.
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: S.optional(S.String),
      status: S.optional(Extraction.ExtractionStatus),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Extraction.Model.json,
    error: S.Never,
    stream: true,
  })
).prefix("extraction_") {}
