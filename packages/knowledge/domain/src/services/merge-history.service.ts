/**
 * MergeHistory service contract for Knowledge slice
 *
 * Defines the interface for audit trail management of entity resolution decisions.
 * Records when entities are merged, why they were merged, and who approved.
 * Enables temporal analysis and re-resolution if merge decisions need reversal.
 *
 * Implementation is provided by the server package via MergeHistoryRepo.
 *
 * @module knowledge-domain/services/MergeHistory
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import type { Model as MergeHistoryModel } from "../entities/merge-history/merge-history.model";
import { MergeError } from "../errors/merge.errors";
import type { MergeParams } from "../value-objects/merge-params.value";

const $I = $KnowledgeDomainId.create("services/MergeHistory");

/**
 * MergeHistory service shape
 *
 * @since 0.1.0
 * @category types
 */
export interface MergeHistoryService {
  /**
   * Record an entity merge decision
   */
  readonly recordMerge: (params: MergeParams) => Effect.Effect<MergeHistoryModel, MergeError>;

  /**
   * Get merge history for a target entity
   */
  readonly getMergeHistory: (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
  ) => Effect.Effect<ReadonlyArray<MergeHistoryModel>, MergeError>;

  /**
   * Get all merges by a specific user
   */
  readonly getMergesByUser: (
    userId: SharedEntityIds.UserId.Type
  ) => Effect.Effect<ReadonlyArray<MergeHistoryModel>, MergeError>;
}
export const $MergeHistoryId = $I`MergeHistory`
/**
 * MergeHistory service for audit trail of entity resolution decisions.
 *
 * Records and queries entity merge history for provenance tracking.
 * Enables temporal analysis and re-resolution if merge decisions need reversal.
 *
 * @since 0.1.0
 * @category services
 */
export class MergeHistory extends Effect.Service<MergeHistory>()($MergeHistoryId, {
  accessors: true,
  effect: Effect.gen(function* () {
    const service: MergeHistoryService = {
      recordMerge: (params) =>
        Effect.fail(
          new MergeError({
            message: "MergeHistory.recordMerge not implemented - provide implementation via Layer",
            sourceEntityId: params.sourceEntityId,
            targetEntityId: params.targetEntityId,
          })
        ).pipe(
          Effect.withSpan("MergeHistory.recordMerge", {
            attributes: {
              sourceEntityId: params.sourceEntityId,
              targetEntityId: params.targetEntityId,
              mergeReason: params.mergeReason,
            },
          })
        ),

      getMergeHistory: (entityId) =>
        Effect.fail(
          new MergeError({
            message: "MergeHistory.getMergeHistory not implemented - provide implementation via Layer",
            targetEntityId: entityId,
          })
        ).pipe(
          Effect.withSpan("MergeHistory.getMergeHistory", {
            attributes: { entityId },
          })
        ),

      getMergesByUser: (userId) =>
        Effect.fail(
          new MergeError({
            message: "MergeHistory.getMergesByUser not implemented - provide implementation via Layer",
          })
        ).pipe(
          Effect.withSpan("MergeHistory.getMergesByUser", {
            attributes: { userId },
          })
        ),
    };

    return service;
  }),
}) {}
