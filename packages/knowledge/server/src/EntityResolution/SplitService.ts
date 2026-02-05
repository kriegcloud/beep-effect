import { type MergeError, SplitError } from "@beep/knowledge-domain/errors";
import { MergeHistory, SplitService } from "@beep/knowledge-domain/services";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { MergeHistoryRepo } from "@beep/knowledge-server/db/repos/MergeHistory.repo";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const wrapSplitError =
  <A>(effect: Effect.Effect<A, DatabaseError | MergeError | SplitError>) =>
  (entityId?: undefined | KnowledgeEntityIds.KnowledgeEntityId.Type) =>
    effect.pipe(
      Effect.catchTags({
        DatabaseError: (error: { readonly message: string }) =>
          new SplitError({
            message: `Database operation failed: ${error.message}`,
            entityId,
            cause: error,
          }),
        MergeError: (error: { readonly message: string }) =>
          new SplitError({
            message: `Merge history operation failed: ${error.message}`,
            entityId,
            cause: error,
          }),
      })
    );

export const SplitServiceLive = Layer.effect(
  SplitService,
  Effect.gen(function* () {
    const entityRepo = yield* EntityRepo;
    const mentionRecordRepo = yield* MentionRecordRepo;
    const mergeHistoryRepo = yield* MergeHistoryRepo;
    const mergeHistory = yield* MergeHistory;
    const authContext = yield* AuthContext;
    const organizationId = authContext.session.activeOrganizationId;

    const splitEntity = Effect.fn(
      function* (params: {
        readonly entityId: KnowledgeEntityIds.KnowledgeEntityId.Type;
        readonly mentionRecordIds: ReadonlyArray<KnowledgeEntityIds.MentionRecordId.Type>;
      }) {
        const maybeEntity = yield* entityRepo.findById(params.entityId);
        const originalEntity = yield* maybeEntity.pipe(
          Effect.mapError(
            () =>
              new SplitError({
                message: `Entity not found: ${params.entityId}`,
                entityId: params.entityId,
              })
          )
        );

        if (A.isEmptyReadonlyArray(params.mentionRecordIds)) {
          return yield* new SplitError({
            message: "At least one mention record ID is required for split",
            entityId: params.entityId,
          });
        }

        const resolvedMentions = yield* mentionRecordRepo.findByResolvedEntityId(params.entityId, organizationId);

        const resolvedMentionIdSet = HashSet.fromIterable(A.map(resolvedMentions, (m) => m.id));

        const invalidIds = A.filter(params.mentionRecordIds, (id) => !HashSet.has(resolvedMentionIdSet, id));

        if (A.isNonEmptyReadonlyArray(invalidIds)) {
          return yield* new SplitError({
            message: `Mention records not resolved to entity ${params.entityId}: ${A.join(invalidIds, ", ")}`,
            entityId: params.entityId,
          });
        }

        const splitMentionIdSet = HashSet.fromIterable(params.mentionRecordIds);
        const mentionsToSplit = A.filter(resolvedMentions, (m) => HashSet.has(splitMentionIdSet, m.id));

        const firstMention = yield* O.match(A.head(mentionsToSplit), {
          onNone: () =>
            Effect.fail(
              new SplitError({
                message: "No valid mentions found for split",
                entityId: params.entityId,
              })
            ),
          onSome: Effect.succeed,
        });

        const newEntityId = KnowledgeEntityIds.KnowledgeEntityId.create();

        const newEntity = yield* entityRepo.insert({
          id: newEntityId,
          organizationId: originalEntity.organizationId,
          mention: firstMention.rawText,
          types: originalEntity.types,
          attributes: {},
          ontologyId: originalEntity.ontologyId,
          documentId: O.fromNullable(firstMention.documentId),
          sourceUri: originalEntity.sourceUri,
          extractionId: O.fromNullable(firstMention.extractionId),
          groundingConfidence: O.none(),
          mentions: O.none(),
          source: O.none(),
          deletedAt: O.none(),
          createdBy: O.fromNullable(authContext.user.id),
          updatedBy: O.none(),
          deletedBy: O.none(),
        });

        yield* Effect.forEach(
          params.mentionRecordIds,
          (mentionRecordId) => mentionRecordRepo.updateResolvedEntityId(mentionRecordId, newEntityId),
          { concurrency: "unbounded" }
        );

        yield* mergeHistory.recordMerge({
          sourceEntityId: params.entityId,
          targetEntityId: newEntityId,
          mergeReason: "manual_override",
          confidence: 1.0,
          mergedBy: authContext.user.id,
        });

        yield* Effect.logInfo("Entity split completed").pipe(
          Effect.annotateLogs({
            originalEntityId: params.entityId,
            newEntityId,
            mentionRecordCount: A.length(params.mentionRecordIds),
          })
        );

        return { originalEntity, newEntity };
      },
      (effect, params) =>
        wrapSplitError(
          effect.pipe(
            Effect.withSpan("SplitService.splitEntity", {
              attributes: {
                entityId: params.entityId,
                mentionRecordCount: A.length(params.mentionRecordIds),
                organizationId,
              },
            })
          )
        )(KnowledgeEntityIds.KnowledgeEntityId.make(params.entityId))
    );

    const unmerge = Effect.fnUntraced(
      function* (mergeHistoryId: KnowledgeEntityIds.MergeHistoryId.Type) {
        const maybeRecord = yield* mergeHistoryRepo.findById(mergeHistoryId);
        const historyRecord = yield* maybeRecord.pipe(
          Effect.mapError(
            (_) =>
              new SplitError({
                message: `Merge history record not found: ${mergeHistoryId}`,
              })
          )
        );

        const mentionsOnTarget = yield* mentionRecordRepo.findByResolvedEntityId(
          historyRecord.targetEntityId,
          organizationId
        );

        const sourceEntityExists = yield* entityRepo.findById(historyRecord.sourceEntityId).pipe(Effect.map(O.isSome));

        if (sourceEntityExists) {
          yield* Effect.forEach(
            mentionsOnTarget,
            (mention) => mentionRecordRepo.updateResolvedEntityId(mention.id, historyRecord.sourceEntityId),
            { concurrency: "unbounded" }
          );
        } else {
          const restoredEntityId = historyRecord.sourceEntityId;

          const maybeTargetEntity = yield* entityRepo.findById(historyRecord.targetEntityId);
          const targetEntity = yield* O.match(maybeTargetEntity, {
            onNone: () =>
              new SplitError({
                message: `Target entity not found for unmerge: ${historyRecord.targetEntityId}`,
              }),
            onSome: Effect.succeed,
          });

          const restoredMention = O.match(A.head(mentionsOnTarget), {
            onNone: () => targetEntity.mention,
            onSome: (m) => m.rawText,
          });

          yield* entityRepo.insert({
            id: restoredEntityId,
            organizationId: targetEntity.organizationId,
            mention: restoredMention,
            types: targetEntity.types,
            attributes: {},
            ontologyId: targetEntity.ontologyId,
            documentId: targetEntity.documentId,
            sourceUri: targetEntity.sourceUri,
            extractionId: targetEntity.extractionId,
            groundingConfidence: O.none(),
            mentions: O.none(),
            source: O.none(),
            deletedAt: O.none(),
            createdBy: O.fromNullable(authContext.user.id),
            updatedBy: O.none(),
            deletedBy: O.none(),
          });

          yield* Effect.forEach(
            mentionsOnTarget,
            (mention) => mentionRecordRepo.updateResolvedEntityId(mention.id, restoredEntityId),
            { concurrency: "unbounded" }
          );
        }

        yield* mergeHistory.recordMerge({
          sourceEntityId: historyRecord.targetEntityId,
          targetEntityId: historyRecord.sourceEntityId,
          mergeReason: "manual_override",
          confidence: 1.0,
          mergedBy: authContext.user.id,
        });

        yield* Effect.logInfo("Unmerge completed").pipe(
          Effect.annotateLogs({
            mergeHistoryId,
            sourceEntityId: historyRecord.sourceEntityId,
            targetEntityId: historyRecord.targetEntityId,
          })
        );
      },
      (effect, mergeHistoryId) =>
        wrapSplitError(
          effect.pipe(
            Effect.withSpan("SplitService.unmerge", {
              attributes: {
                mergeHistoryId,
                organizationId,
              },
            })
          )
        )
    );
    return SplitService.of({
      splitEntity,
      unmerge,
    });
  })
);
