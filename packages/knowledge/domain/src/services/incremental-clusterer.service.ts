/**
 * IncrementalClusterer service contract for Knowledge slice
 *
 * Defines the interface for clustering new MentionRecords against
 * the existing entity corpus. Groups mentions that likely refer to
 * the same entity for subsequent resolution.
 *
 * Performance target: <5s for 100 mentions against 10K entity corpus.
 *
 * STUB: Phase 4 will implement full clustering logic.
 *
 * @module knowledge-domain/services/IncrementalClusterer
 * @since 0.1.0
 */
import {$KnowledgeDomainId} from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type {Model as MentionRecordModel} from "../entities/mention-record/mention-record.model";
import {ClusterError} from "../errors/cluster.errors";

const $I = $KnowledgeDomainId.create("services/IncrementalClusterer");

/**
 * IncrementalClusterer service shape
 *
 * @since 0.1.0
 * @category types
 */
export interface IncrementalClustererService {
  /**
   * Cluster new mentions against existing entity corpus.
   *
   * Groups MentionRecords that likely refer to the same entity by:
   * 1. Finding candidate entities via EntityRegistry
   * 2. Computing pairwise similarity scores
   * 3. Forming clusters using threshold-based grouping
   *
   * Performance target: <5s for 100 mentions against 10K entity corpus.
   *
   * @param mentions MentionRecords to cluster
   * @returns Effect that completes when clustering is done
   */
  readonly cluster: (
    mentions: ReadonlyArray<MentionRecordModel>
  ) => Effect.Effect<void, ClusterError>;
}

/**
 * IncrementalClusterer service for clustering mentions against entity corpus.
 *
 * Clusters new MentionRecords by finding candidate entities and
 * grouping mentions that resolve to the same entity.
 *
 * Performance target: <5s for 100 mentions against 10K entity corpus.
 *
 * STUB: Phase 4 will implement full clustering logic.
 *
 * @since 0.1.0
 * @category services
 */
export class IncrementalClusterer extends Effect.Service<IncrementalClusterer>()(
  $I`IncrementalClusterer`,
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const service: IncrementalClustererService = {
        cluster:
          Effect.fn(function* (mentions) {
            // STUB: Phase 4 will implement clustering logic
            // 1. For each mention, find candidate entities via EntityRegistry
            // 2. Compute pairwise similarity scores
            // 3. Form clusters using threshold-based grouping
            // 4. Update mention resolvedEntityId fields
            yield* Effect.logDebug("IncrementalClusterer.cluster stub called", {
              mentionCount: A.length(mentions),
            });
          }, (effect, mentions) => effect.pipe(
            Effect.withSpan("IncrementalClusterer.cluster", {
              attributes: {mentionCount: A.length(mentions)},
            }),
            Effect.mapError(
              (error) =>
                new ClusterError({
                  message: `Clustering failed: ${String(error)}`,
                  cause: error,
                })
            )
          ))
      };

      return service;
    }),
  }
) {
}
