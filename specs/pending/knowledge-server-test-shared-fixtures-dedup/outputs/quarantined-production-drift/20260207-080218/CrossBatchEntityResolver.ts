import { $KnowledgeServerId } from "@beep/identity/packages";
import { type Entities, ValueObjects } from "@beep/knowledge-domain";
import { ClusterError } from "@beep/knowledge-domain/errors";
import { MergeHistory } from "@beep/knowledge-domain/services";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as Str from "effect/String";
import { EntityRegistry } from "../EntityResolution/EntityRegistry";

const $I = $KnowledgeServerId.create("Service/CrossBatchEntityResolver");

export interface ResolvedExisting {
  readonly mentionId: string;
  readonly entityId: string;
  readonly similarityScore: number;
  readonly hadPreviousEntity: boolean;
}

export interface CreatedEntity {
  readonly mentionId: string;
  readonly entityId: string;
  readonly rawText: string;
}

export interface MergeRecorded {
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly confidence: number;
}

export interface CrossBatchResolutionReport {
  readonly resolved: ReadonlyArray<ResolvedExisting>;
  readonly created: ReadonlyArray<CreatedEntity>;
  readonly merges: ReadonlyArray<MergeRecorded>;
  readonly stats: {
    readonly mentionCount: number;
    readonly resolvedCount: number;
    readonly createdCount: number;
    readonly mergeCount: number;
    readonly skippedCount: number;
  };
}

type ResolveOneResult =
  | { readonly _tag: "resolved"; readonly value: ResolvedExisting; readonly merge?: MergeRecorded }
  | { readonly _tag: "created"; readonly value: CreatedEntity };

export interface CrossBatchEntityResolverShape {
  readonly resolveMentions: (
    mentions: ReadonlyArray<S.Schema.Type<typeof Entities.MentionRecord.Model.insert>>
  ) => Effect.Effect<CrossBatchResolutionReport, ClusterError>;
}

export class CrossBatchEntityResolver extends Context.Tag($I`CrossBatchEntityResolver`)<
  CrossBatchEntityResolver,
  CrossBatchEntityResolverShape
>() {}

const serviceEffect: Effect.Effect<
  CrossBatchEntityResolverShape,
  never,
  EntityRegistry | EntityRepo | MentionRecordRepo | MergeHistory | AuthContext
> = Effect.gen(function* () {
  const entityRegistry = yield* EntityRegistry;
  const entityRepo = yield* EntityRepo;
  const mentionRecordRepo = yield* MentionRecordRepo;
  const mergeHistory = yield* MergeHistory;
  const authContext = yield* AuthContext;
  const organizationId = authContext.session.activeOrganizationId;

  const resolveOne = (
    mention: S.Schema.Type<typeof Entities.MentionRecord.Model.insert>
  ): Effect.Effect<O.Option<ResolveOneResult>, never> =>
    Effect.gen(function* () {
      const candidates = yield* entityRegistry.findCandidates(mention);

      if (A.isNonEmptyReadonlyArray(candidates)) {
        const best = A.headNonEmpty(candidates);
        const previousEntityId = mention.resolvedEntityId;

        yield* mentionRecordRepo.updateResolvedEntityId(mention.id, best.entity.id);

        const resolved: ResolvedExisting = {
          mentionId: mention.id,
          entityId: best.entity.id,
          similarityScore: best.similarityScore,
          hadPreviousEntity: O.isSome(previousEntityId),
        };

        if (O.isSome(previousEntityId) && previousEntityId.value !== best.entity.id) {
          const merge: MergeRecorded = {
            sourceEntityId: previousEntityId.value,
            targetEntityId: best.entity.id,
            confidence: best.similarityScore,
          };

          yield* mergeHistory.recordMerge(
            new ValueObjects.MergeParams({
              sourceEntityId: merge.sourceEntityId,
              targetEntityId: merge.targetEntityId,
              mergeReason: "embedding_similarity",
              confidence: merge.confidence,
            })
          );

          yield* Effect.logInfo("CrossBatchEntityResolver: mention resolved to existing entity (merge recorded)").pipe(
            Effect.annotateLogs({
              mentionId: mention.id,
              entityId: best.entity.id,
              similarity: best.similarityScore,
              previousEntityId: previousEntityId.value,
            })
          );

          return O.some({ _tag: "resolved" as const, value: resolved, merge });
        }

        yield* Effect.logInfo("CrossBatchEntityResolver: mention resolved to existing entity").pipe(
          Effect.annotateLogs({
            mentionId: mention.id,
            entityId: best.entity.id,
            similarity: best.similarityScore,
            hadPreviousEntity: O.isSome(previousEntityId),
          })
        );

        return O.some({ _tag: "resolved" as const, value: resolved });
      }

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

      const created: CreatedEntity = { mentionId: mention.id, entityId: newEntityId, rawText: mention.rawText };

      yield* Effect.logInfo("CrossBatchEntityResolver: new entity created from mention").pipe(
        Effect.annotateLogs({
          mentionId: mention.id,
          newEntityId,
          rawText: mention.rawText,
        })
      );

      return O.some({ _tag: "created" as const, value: created });
    }).pipe(
      Effect.catchAll((error) =>
        Effect.logWarning("CrossBatchEntityResolver: failed to resolve mention, skipping").pipe(
          Effect.annotateLogs({
            mentionId: mention.id,
            rawText: mention.rawText,
            error: String(error),
          }),
          Effect.as(O.none())
        )
      ),
      Effect.withSpan($I`resolveOne`, {
        captureStackTrace: false,
        attributes: { mentionId: mention.id },
      })
    );

  const resolveMentions: CrossBatchEntityResolverShape["resolveMentions"] = (mentions) =>
    Effect.gen(function* () {
      yield* Effect.logInfo("CrossBatchEntityResolver.resolveMentions: starting").pipe(
        Effect.annotateLogs({ mentionCount: A.length(mentions) })
      );

      const results = yield* Effect.forEach(mentions, (m) => resolveOne(m), { concurrency: 5 });
      const present = A.filterMap(results, (r) => r);

      const summary = A.reduce(
        present,
        {
          resolved: A.empty<ResolvedExisting>(),
          created: A.empty<CreatedEntity>(),
          merges: A.empty<MergeRecorded>(),
          skippedCount: 0,
        },
        (acc, r) => {
          if (r._tag === "resolved") {
            return {
              ...acc,
              resolved: A.append(acc.resolved, r.value),
              merges: r.merge ? A.append(acc.merges, r.merge) : acc.merges,
            };
          }
          return { ...acc, created: A.append(acc.created, r.value) };
        }
      );

      const report: CrossBatchResolutionReport = {
        resolved: summary.resolved,
        created: summary.created,
        merges: summary.merges,
        stats: {
          mentionCount: A.length(mentions),
          resolvedCount: A.length(summary.resolved),
          createdCount: A.length(summary.created),
          mergeCount: A.length(summary.merges),
          skippedCount: summary.skippedCount,
        },
      };

      yield* Effect.logInfo("CrossBatchEntityResolver.resolveMentions: completed").pipe(Effect.annotateLogs(report.stats));
      return report;
    }).pipe(
      Effect.withSpan("CrossBatchEntityResolver.resolveMentions", {
        captureStackTrace: false,
        attributes: { mentionCount: A.length(mentions) },
      }),
      Effect.mapError(
        (error) =>
          new ClusterError({
            message: `Cross-batch entity resolution failed: ${String(error)}`,
            cause: error,
          })
      )
    );

  return CrossBatchEntityResolver.of({ resolveMentions });
});

export const CrossBatchEntityResolverLive = Layer.effect(CrossBatchEntityResolver, serviceEffect);

