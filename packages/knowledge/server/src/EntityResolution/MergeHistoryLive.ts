/**
 * MergeHistoryLive Layer
 *
 * Provides the live implementation of the MergeHistory domain service
 * by wiring it to the MergeHistoryRepo for database operations.
 * Gets organization context from AuthContext.
 *
 * @module knowledge-server/EntityResolution/MergeHistoryLive
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { MergeError } from "@beep/knowledge-domain/errors";
import {$MergeHistoryId, MergeHistory} from "@beep/knowledge-domain/services";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { MergeHistoryRepo } from "../db/repos/MergeHistory.repo";

const $I = $KnowledgeServerId.create("EntityResolution/MergeHistoryLive");

/**
 * Live implementation of MergeHistory service.
 *
 * Wires the domain MergeHistory service to the MergeHistoryRepo for
 * database operations. Organization context is obtained from AuthContext
 * to scope all queries to the current user's organization.
 *
 * @since 0.1.0
 * @category layers
 */
export const MergeHistoryLive = Layer.effect(
  MergeHistory,
  Effect.gen(function* () {
    const repo = yield* MergeHistoryRepo;
    const authContext = yield* AuthContext;
    const organizationId = authContext.session.activeOrganizationId;

    return MergeHistory.of({
      _tag: $MergeHistoryId,
      recordMerge: (params) =>
        Effect.gen(function* () {
          const id = KnowledgeEntityIds.MergeHistoryId.create();
          const now = yield* DateTime.now;

          // Use repo.insert to get back the created record
          // The insert type requires all fields from makeFields including optional audit fields
          return yield* repo.insert({
            id,
            organizationId: params.organizationId,
            sourceEntityId: params.sourceEntityId,
            targetEntityId: params.targetEntityId,
            mergeReason: params.mergeReason,
            confidence: params.confidence,
            mergedBy: O.fromNullable(params.mergedBy),
            mergedAt: now,
            // Audit fields from makeFields - optional fields as O.none()
            source: O.none(),
            deletedAt: O.none(),
            createdBy: O.fromNullable(authContext.user.id),
            updatedBy: O.none(),
            deletedBy: O.none(),
          });
        }).pipe(
          Effect.withSpan($I`MergeHistory.recordMerge`, {
            attributes: {
              sourceEntityId: params.sourceEntityId,
              targetEntityId: params.targetEntityId,
              mergeReason: params.mergeReason,
              confidence: params.confidence,
            },
          }),
          Effect.mapError(
            (error) =>
              new MergeError({
                message: `Failed to record merge: ${String(error)}`,
                sourceEntityId: params.sourceEntityId,
                targetEntityId: params.targetEntityId,
              })
          )
        ),

      getMergeHistory: (entityId) =>
        repo.findByTargetEntity(entityId, organizationId).pipe(
          Effect.withSpan($I`MergeHistory.getMergeHistory`, {
            attributes: { entityId, organizationId },
          }),
          Effect.mapError(
            (error) =>
              new MergeError({
                message: `Failed to get merge history: ${String(error)}`,
                targetEntityId: entityId,
              })
          )
        ),

      getMergesByUser: (userId) =>
        repo.findByUser(userId, organizationId, 100).pipe(
          Effect.withSpan($I`MergeHistory.getMergesByUser`, {
            attributes: { userId, organizationId },
          }),
          Effect.mapError(
            (error) =>
              new MergeError({
                message: `Failed to get merges by user: ${String(error)}`,
              })
          )
        ),
    });
  })
);
