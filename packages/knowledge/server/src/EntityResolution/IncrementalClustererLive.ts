import { $KnowledgeServerId } from "@beep/identity/packages";
import { type Entities, ValueObjects } from "@beep/knowledge-domain";
import { ClusterError } from "@beep/knowledge-domain/errors";
import { IncrementalClusterer, MergeHistory } from "@beep/knowledge-domain/services";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import { EntityRegistry } from "./EntityRegistry";

const $I = $KnowledgeServerId.create("EntityResolution/IncrementalClustererLive");

export const IncrementalClustererLive = Layer.effect(
  IncrementalClusterer,
  Effect.gen(function* () {
    const entityRegistry = yield* EntityRegistry;
    const entityRepo = yield* EntityRepo;
    const mentionRecordRepo = yield* MentionRecordRepo;
    const mergeHistory = yield* MergeHistory;
    const authContext = yield* AuthContext;
    const organizationId = authContext.session.activeOrganizationId;

    const resolveMention = (
      mention: S.Schema.Type<typeof Entities.MentionRecord.Model.insert>
    ): Effect.Effect<void, ClusterError> =>
      Effect.gen(function* () {
        const candidates = yield* entityRegistry.findCandidates(mention);

        if (A.isNonEmptyReadonlyArray(candidates)) {
          const best = A.headNonEmpty(candidates);
          const previousEntityId = mention.resolvedEntityId;

          yield* mentionRecordRepo.updateResolvedEntityId(mention.id, best.entity.id);

          if (O.isSome(previousEntityId) && previousEntityId.value !== best.entity.id) {
            yield* mergeHistory.recordMerge(
              new ValueObjects.MergeParams({
                sourceEntityId: previousEntityId.value,
                targetEntityId: best.entity.id,
                mergeReason: "embedding_similarity",
                confidence: best.similarityScore,
              })
            );
          }

          yield* Effect.logInfo("IncrementalClusterer: mention resolved to existing entity").pipe(
            Effect.annotateLogs({
              mentionId: mention.id,
              entityId: best.entity.id,
              similarity: best.similarityScore,
              hadPreviousEntity: O.isSome(previousEntityId),
            })
          );
        } else {
          const newEntityId = KnowledgeEntityIds.KnowledgeEntityId.create();

          yield* entityRepo.insert({
            id: newEntityId,
            organizationId,
            mention: mention.rawText,
            types: [mention.mentionType],
            attributes: {},
            ontologyId: O.none(),
            documentId: O.some(mention.documentId),
            sourceUri: O.none(),
            extractionId: O.some(mention.extractionId),
            groundingConfidence: O.some(mention.confidence),
            mentions: O.none(),
            source: O.none(),
            deletedAt: O.none(),
            createdBy: O.fromNullable(authContext.user.id),
            updatedBy: O.none(),
            deletedBy: O.none(),
          });

          yield* mentionRecordRepo.updateResolvedEntityId(mention.id, newEntityId);

          yield* entityRegistry.addToBloomFilter(mention.rawText);

          yield* Effect.logInfo("IncrementalClusterer: new entity created from mention").pipe(
            Effect.annotateLogs({
              mentionId: mention.id,
              newEntityId,
              rawText: mention.rawText,
            })
          );
        }
      }).pipe(
        Effect.catchAll((error) =>
          Effect.logWarning("IncrementalClusterer: failed to resolve mention, skipping").pipe(
            Effect.annotateLogs({
              mentionId: mention.id,
              rawText: mention.rawText,
              error: String(error),
            })
          )
        ),
        Effect.withSpan($I`resolveMention`, {
          captureStackTrace: false,
          attributes: { mentionId: mention.id, rawText: mention.rawText },
        })
      );

    return IncrementalClusterer.of({
      cluster: Effect.fn(
        function* (mentions: ReadonlyArray<S.Schema.Type<typeof Entities.MentionRecord.Model.insert>>) {
          yield* Effect.logInfo("IncrementalClusterer.cluster: starting").pipe(
            Effect.annotateLogs({ mentionCount: A.length(mentions) })
          );

          yield* Effect.forEach(mentions, (mention) => resolveMention(mention), {
            concurrency: 5,
          });

          yield* Effect.logInfo("IncrementalClusterer.cluster: completed").pipe(
            Effect.annotateLogs({ mentionCount: A.length(mentions) })
          );
        },
        (effect, mentions) =>
          effect.pipe(
            Effect.withSpan("IncrementalClusterer.cluster", {
              attributes: { mentionCount: A.length(mentions) },
            }),
            Effect.mapError(
              (error) =>
                new ClusterError({
                  message: `Clustering failed: ${String(error)}`,
                  cause: error,
                })
            )
          )
      ),
    });
  })
);
