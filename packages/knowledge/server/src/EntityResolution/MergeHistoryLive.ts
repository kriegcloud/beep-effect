import { $KnowledgeServerId } from "@beep/identity/packages";
import { MergeError } from "@beep/knowledge-domain/errors";
import { MergeHistory } from "@beep/knowledge-domain/services";
import { MergeHistoryRepo } from "@beep/knowledge-server/db/repos/MergeHistory.repo";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const $I = $KnowledgeServerId.create("EntityResolution/MergeHistoryLive");

export const MergeHistoryLive = Layer.effect(
  MergeHistory,
  Effect.gen(function* () {
    const repo = yield* MergeHistoryRepo;
    const authCtx = yield* AuthContext;
    const organizationId = authCtx.session.activeOrganizationId;
    const currentUserId = authCtx.user.id;

    return {
      recordMerge: (params) =>
        Effect.gen(function* () {
          const id = KnowledgeEntityIds.MergeHistoryId.create();
          const now = yield* DateTime.now;

          const { data } = yield* repo.insert({
            id,
            organizationId: organizationId,
            sourceEntityId: params.sourceEntityId,
            targetEntityId: params.targetEntityId,
            mergeReason: params.mergeReason,
            confidence: params.confidence,
            mergedBy: O.fromNullable(params.mergedBy),
            mergedAt: now,
            source: O.some($I`MergeHistory.recordMerge`),
            deletedAt: O.none(),
            createdBy: O.some(currentUserId),
            updatedBy: O.some(currentUserId),
            deletedBy: O.none(),
          });
          return data;
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
                cause: error,
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
                cause: error,
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
                cause: error,
              })
          )
        ),
    };
  })
);
