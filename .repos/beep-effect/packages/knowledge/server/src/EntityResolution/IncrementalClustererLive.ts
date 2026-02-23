import type { Entities } from "@beep/knowledge-domain";
import { ClusterError } from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as S from "effect/Schema";
import { CrossBatchEntityResolver, CrossBatchEntityResolverLive } from "../Service/CrossBatchEntityResolver";

export const IncrementalClustererLive = Layer.effect(
  IncrementalClusterer,
  Effect.gen(function* () {
    const resolver = yield* CrossBatchEntityResolver;

    return IncrementalClusterer.of({
      cluster: Effect.fn(
        function* (mentions: ReadonlyArray<S.Schema.Type<typeof Entities.MentionRecord.Model.insert>>) {
          yield* Effect.logInfo("IncrementalClusterer.cluster: starting").pipe(
            Effect.annotateLogs({ mentionCount: A.length(mentions) })
          );

          const result = yield* resolver.resolveMentions(mentions);

          yield* Effect.logInfo("IncrementalClusterer.cluster: completed").pipe(
            Effect.annotateLogs({
              mentionCount: A.length(mentions),
              linkedExisting: result.stats.linkedExisting,
              createdNew: result.stats.createdNew,
            })
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
).pipe(Layer.provide(CrossBatchEntityResolverLive));
