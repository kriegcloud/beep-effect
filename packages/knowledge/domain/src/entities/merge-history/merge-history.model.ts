/**
 * MergeHistory domain model for Knowledge slice
 *
 * Represents an audit trail record of entity resolution decisions.
 * Records when entities are merged, why they were merged, and who approved the merge.
 * Enables temporal tracking and re-resolution if merge decisions need reversal.
 *
 * @module knowledge-domain/entities/MergeHistory
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MergeHistory");

/**
 * MergeReason - Why entities were merged
 *
 * @since 0.1.0
 * @category enums
 */
export const MergeReason = S.Literal("embedding_similarity", "manual_override", "text_exact_match");

export type MergeReason = S.Schema.Type<typeof MergeReason>;

/**
 * MergeHistory model for audit trail of entity resolution decisions.
 *
 * Records when entities are merged, why they were merged, and who approved the merge.
 * Enables temporal tracking and re-resolution if merge decisions need reversal.
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`MergeHistoryModel`)(
  makeFields(KnowledgeEntityIds.MergeHistoryId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Entity being merged (source)
     */
    sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the entity being merged into another",
    }),

    /**
     * Canonical entity (target)
     */
    targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the canonical entity (merge target)",
    }),

    /**
     * Why the merge occurred
     */
    mergeReason: MergeReason.annotations({
      description: "Reason for the merge decision",
    }),

    /**
     * Similarity confidence score (0-1)
     */
    confidence: S.Number.pipe(S.between(0, 1)).annotations({
      description: "Confidence score for the merge decision",
    }),

    /**
     * User who approved the merge (null for automatic merges)
     */
    mergedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "User ID who approved the merge (null for automatic)",
      })
    ),

    /**
     * When the merge occurred
     */
    mergedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the merge was executed",
    }),
  }),
  $I.annotations("MergeHistoryModel", {
    description: "Audit record of entity merge decisions for provenance tracking.",
  })
) {
  static readonly utils = modelKit(Model);

  /**
   * Check if merge was manual (user-approved)
   */
  get isManualMerge(): boolean {
    return this.mergedBy !== undefined;
  }

  /**
   * Check if merge was automatic (algorithm-driven)
   */
  get isAutomaticMerge(): boolean {
    return this.mergedBy === undefined;
  }
}
