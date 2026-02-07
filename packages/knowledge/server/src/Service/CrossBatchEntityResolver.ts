import {$KnowledgeServerId} from "@beep/identity/packages";
import { type Entities, ValueObjects } from "@beep/knowledge-domain";
import { ClusterError } from "@beep/knowledge-domain/errors";
import { MergeHistory } from "@beep/knowledge-domain/services";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { EntityRegistry } from "@beep/knowledge-server/EntityResolution/EntityRegistry";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Service/CrossBatchEntityResolver");

export class ResolutionDecision extends BS.StringLiteralKit("linked_existing", "created_new").annotations(
  $I.annotations("ResolutionDecision", { description: "Cross-batch resolution decision for a mention" })
) {}

export class ResolvedMention extends S.Class<ResolvedMention>($I`ResolvedMention`)({
  mentionRecordId: KnowledgeEntityIds.MentionRecordId,
  resolvedEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  decision: ResolutionDecision,
  similarityScore: S.optionalWith(S.OptionFromNullishOr(S.Number, null), { default: O.none<number> }),
}) {}

export class CrossBatchResolutionStats extends S.Class<CrossBatchResolutionStats>($I`CrossBatchResolutionStats`)({
  total: S.NonNegativeInt,
  linkedExisting: S.NonNegativeInt,
  createdNew: S.NonNegativeInt,
}) {}

export class CrossBatchResolutionResult extends S.Class<CrossBatchResolutionResult>($I`CrossBatchResolutionResult`)({
  resolved: S.Array(ResolvedMention),
  resolvedMap: BS.MutableHashMap({
    key: KnowledgeEntityIds.MentionRecordId,
    value: KnowledgeEntityIds.KnowledgeEntityId,
  }),
  stats: CrossBatchResolutionStats,
}) {}

export interface CrossBatchEntityResolverShape {
  /**
   * Resolves mention records against the persistent entity registry.
   *
   * This is intentionally cross-batch: it may link to existing entities, or create new ones.
   */
  readonly resolveMentions: (
    mentions: ReadonlyArray<S.Schema.Type<typeof Entities.MentionRecord.Model.insert>>
  ) => Effect.Effect<CrossBatchResolutionResult, ClusterError>;
}

export class CrossBatchEntityResolver extends Context.Tag($I`CrossBatchEntityResolver`)<
  CrossBatchEntityResolver,
  CrossBatchEntityResolverShape
>() {}

const serviceEffect: Effect.Effect<
  CrossBatchEntityResolverShape,
  never,
  EntityRegistry | EntityRepo | MentionRecordRepo | MergeHistory
> = Effect.gen(function* () {
  const entityRegistry = yield* EntityRegistry;
  const entityRepo = yield* EntityRepo;
  const mentionRecordRepo = yield* MentionRecordRepo;
  const mergeHistory = yield* MergeHistory;

  const resolveMention = (
    mention: S.Schema.Type<typeof Entities.MentionRecord.Model.insert>
  ): Effect.Effect<ResolvedMention, ClusterError> =>
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

        return new ResolvedMention({
          mentionRecordId: mention.id,
          resolvedEntityId: best.entity.id,
          decision: "linked_existing",
          similarityScore: O.some(best.similarityScore),
        });
      }

      const newEntityId = KnowledgeEntityIds.KnowledgeEntityId.create();

      yield* entityRepo.insert({
        id: newEntityId,
        organizationId: mention.organizationId,
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
        createdBy: mention.createdBy,
        updatedBy: O.none(),
        deletedBy: O.none(),
      });

      yield* mentionRecordRepo.updateResolvedEntityId(mention.id, newEntityId);
      yield* entityRegistry.addToBloomFilter(mention.rawText);

      return new ResolvedMention({
        mentionRecordId: mention.id,
        resolvedEntityId: newEntityId,
        decision: "created_new",
        similarityScore: O.none(),
      });
    }).pipe(
      Effect.mapError(
        (error) =>
          new ClusterError({
            message: `Cross-batch resolution failed: ${String(error)}`,
            cause: error,
          })
      )
    );

  const resolveMentions: CrossBatchEntityResolverShape["resolveMentions"] = Effect.fn(
    "CrossBatchEntityResolver.resolveMentions"
  )((mentions) =>
    Effect.gen(function* () {
      if (A.isEmptyReadonlyArray(mentions)) {
        return new CrossBatchResolutionResult({
          resolved: [],
          resolvedMap: MutableHashMap.empty(),
          stats: new CrossBatchResolutionStats({ total: 0, linkedExisting: 0, createdNew: 0 }),
        });
      }

      const resolvedAttempts = yield* Effect.forEach(mentions, (mention) => Effect.either(resolveMention(mention)), {
        concurrency: 5,
      });

      const resolved = A.filterMap(resolvedAttempts, (attempt) => {
        if (Either.isRight(attempt)) {
          return O.some(attempt.right);
        }
        return O.none();
      });

      const failures = A.filter(resolvedAttempts, Either.isLeft);
      if (A.isNonEmptyReadonlyArray(failures)) {
        yield* Effect.logWarning("Cross-batch resolution skipped some mentions due to errors").pipe(
          Effect.annotateLogs({ failureCount: A.length(failures) })
        );
      }

      const stats = new CrossBatchResolutionStats(
        A.reduce(resolved, { total: A.length(mentions), linkedExisting: 0, createdNew: 0 }, (acc, r) => {
          if (r.decision === "linked_existing") {
            return { ...acc, linkedExisting: acc.linkedExisting + 1 };
          }
          return { ...acc, createdNew: acc.createdNew + 1 };
        })
      );

      return new CrossBatchResolutionResult({
        resolved,
        resolvedMap: MutableHashMap.fromIterable(
          A.map(resolved, (r) => [r.mentionRecordId, r.resolvedEntityId] as const)
        ),
        stats,
      });
    })
  );

  return CrossBatchEntityResolver.of({ resolveMentions });
});

export const CrossBatchEntityResolverLive = Layer.effect(CrossBatchEntityResolver, serviceEffect);
