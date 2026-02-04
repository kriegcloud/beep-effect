/**
 * CanonicalSelector - Canonical entity selection for clusters
 *
 * Selects the best representative entity for each cluster using
 * various strategies (confidence, attribute count, hybrid).
 *
 * @module knowledge-server/EntityResolution/CanonicalSelector
 * @since 0.1.0
 */

import { $KnowledgeServerId } from "@beep/identity/packages";
import { CanonicalSelectionError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import type { AssembledEntity } from "../Extraction/GraphAssembler";

const $I = $KnowledgeServerId.create("EntityResolution/CanonicalSelector");
// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Strategy for selecting canonical entity
 *
 * @since 0.1.0
 * @category types
 */
export class SelectionStrategy extends BS.StringLiteralKit(
  "highest_confidence",
  "most_attributes",
  "most_mentions",
  "hybrid"
).annotations(
  $I.annotations("SelectionStrategy", {
    description: "Strategy for selecting canonical entity",
  })
) {}

export declare namespace SelectionStrategy {
  export type Type = typeof SelectionStrategy.Type;
}

/**
 * Configuration for canonical selection
 *
 * @since 0.1.0
 * @category config
 */
export interface CanonicalSelectorConfig {
  /**
   * Selection strategy
   * @default "hybrid"
   */
  readonly strategy?: undefined | SelectionStrategy.Type;

  /**
   * Weights for hybrid strategy
   */
  readonly weights?:
    | undefined
    | {
        readonly confidence?: undefined | number;
        readonly attributeCount?: undefined | number;
        readonly mentionLength?: undefined | number;
      };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Count attributes in an entity
 */
const countAttributes = (entity: AssembledEntity): number => {
  return Struct.keys(entity.attributes).length;
};

/**
 * Compute hybrid score for an entity
 */
const computeHybridScore = (
  entity: AssembledEntity,
  weights: { readonly confidence: number; readonly attributeCount: number; readonly mentionLength: number }
): number => {
  const confidenceScore = entity.confidence * weights.confidence;
  const attributeScore = Math.min(countAttributes(entity) / 10, 1) * weights.attributeCount;
  const mentionScore = Math.min(entity.mention.length / 50, 1) * weights.mentionLength;

  return confidenceScore + attributeScore + mentionScore;
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * CanonicalSelector Service
 *
 * Selects the canonical (representative) entity for each cluster based on
 * configurable selection strategies.
 *
 * @example
 * ```ts
 * import { CanonicalSelector } from "@beep/knowledge-server/EntityResolution";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const selector = yield* CanonicalSelector;
 *   const canonical = yield* selector.selectCanonical(clusterMembers, {
 *     strategy: "hybrid",
 *   });
 *
 *   console.log(`Selected canonical: ${canonical.mention}`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class CanonicalSelector extends Effect.Service<CanonicalSelector>()($I`CanonicalSelector`, {
  accessors: true,
  effect: Effect.succeed({
    /**
     * Select canonical entity for a cluster
     *
     * @param cluster - Entities in the cluster
     * @param config - Selection configuration
     * @returns Selected canonical entity
     */
    selectCanonical: Effect.fn(
      (cluster: readonly AssembledEntity[], config: CanonicalSelectorConfig = {}) =>
        Effect.gen(function* () {
        if (A.isEmptyReadonlyArray(cluster)) {
          return yield* new CanonicalSelectionError({
            message: "Cannot select canonical from empty cluster",
            reason: "empty_cluster",
            clusterSize: 0,
          });
        }

        if (cluster.length === 1) {
          const single = cluster[0];
          if (!single) {
            return yield* new CanonicalSelectionError({
              message: "Cannot select canonical from empty cluster",
              reason: "empty_cluster",
              clusterSize: 0,
            });
          }
          return single;
        }

        const strategy = config.strategy ?? SelectionStrategy.Enum.hybrid;

        yield* Effect.logDebug("CanonicalSelector.selectCanonical", {
          strategy,
          clusterSize: cluster.length,
        });

        const selected = Match.value(strategy).pipe(
          Match.when(SelectionStrategy.Enum.highest_confidence, () =>
            // Select entity with highest confidence
            F.pipe(
              A.head(cluster),
              O.map((first) =>
                A.reduce(cluster, first, (best, current) => (current.confidence > best.confidence ? current : best))
              ),
              O.getOrUndefined
            )
          ),
          Match.when(SelectionStrategy.Enum.most_attributes, () =>
            // Select entity with most attributes
            F.pipe(
              A.head(cluster),
              O.map((first) =>
                A.reduce(cluster, first, (best, current) =>
                  countAttributes(current) > countAttributes(best) ? current : best
                )
              ),
              O.getOrUndefined
            )
          ),
          Match.when(SelectionStrategy.Enum.most_mentions, () =>
            // Select entity with longest mention (proxy for specificity)
            F.pipe(
              A.head(cluster),
              O.map((first) =>
                A.reduce(cluster, first, (best, current) =>
                  current.mention.length > best.mention.length ? current : best
                )
              ),
              O.getOrUndefined
            )
          ),
          Match.orElse(() => {
            // "hybrid" strategy (default): Combine all factors with weights
            const weights = {
              confidence: config.weights?.confidence ?? 0.5,
              attributeCount: config.weights?.attributeCount ?? 0.3,
              mentionLength: config.weights?.mentionLength ?? 0.2,
            };

            return F.pipe(
              A.head(cluster),
              O.map((first) =>
                A.reduce(cluster, first, (best, current) =>
                  computeHybridScore(current, weights) > computeHybridScore(best, weights) ? current : best
                )
              ),
              O.getOrUndefined
            );
          })
        );

        if (!selected) {
          return yield* new CanonicalSelectionError({
            message: "Failed to select canonical entity",
            reason: "selection_failed",
            clusterSize: cluster.length,
          });
        }

        yield* Effect.logDebug("CanonicalSelector.selectCanonical: selected", {
          canonicalId: selected.id,
          canonicalMention: selected.mention,
          confidence: selected.confidence,
        });

        return selected;
      })
    ),

    /**
     * Merge attributes from cluster members into canonical entity
     *
     * Non-destructively combines attributes from all members, preferring
     * the canonical entity's values for conflicts.
     *
     * @param canonical - Selected canonical entity
     * @param members - Other cluster members
     * @returns Canonical entity with merged attributes
     */
    mergeAttributes: Effect.fn(
      (canonical: AssembledEntity, members: readonly AssembledEntity[]) =>
        Effect.gen(function* () {
        if (A.isEmptyReadonlyArray(members)) {
          return canonical;
        }

        yield* Effect.logDebug("CanonicalSelector.mergeAttributes", {
          canonicalId: canonical.id,
          memberCount: members.length,
        });

        // Start with canonical's attributes
        const mergedAttributes: Record<string, string | number | boolean> = {
          ...canonical.attributes,
        };

        // Add attributes from members that canonical doesn't have
        for (const member of members) {
          for (const [key, value] of Struct.entries(member.attributes)) {
            if (!(key in mergedAttributes)) {
              mergedAttributes[key] = value;
            }
          }
        }

        // Merge all types (union)
        const allTypes = MutableHashSet.fromIterable(canonical.types);
        for (const member of members) {
          for (const type of member.types) {
            MutableHashSet.add(allTypes, type);
          }
        }

        // Update confidence to max across cluster
        const maxConfidence = Math.max(canonical.confidence, ...A.map(members, (m) => m.confidence));

        const merged: AssembledEntity = {
          ...canonical,
          types: A.fromIterable(allTypes),
          attributes: mergedAttributes,
          confidence: maxConfidence,
        };

        yield* Effect.logDebug("CanonicalSelector.mergeAttributes: complete", {
          originalAttributeCount: Struct.keys(canonical.attributes).length,
          mergedAttributeCount: Struct.keys(mergedAttributes).length,
          originalTypeCount: canonical.types.length,
          mergedTypeCount: merged.types.length,
        });

        return merged;
      })
    ),

    /**
     * Compute a quality score for an entity
     *
     * Useful for ranking entities or understanding cluster quality.
     *
     * @param entity - Entity to score
     * @returns Quality score (0-1)
     */
    computeQualityScore: Effect.fn((entity: AssembledEntity) =>
      Effect.sync(() => {
        const weights = {
          confidence: 0.4,
          attributeCount: 0.3,
          mentionLength: 0.15,
          typeCount: 0.15,
        };

        const confidenceScore = entity.confidence * weights.confidence;
        const attributeScore = Math.min(countAttributes(entity) / 10, 1) * weights.attributeCount;
        const mentionScore = Math.min(entity.mention.length / 50, 1) * weights.mentionLength;
        const typeScore = Math.min(entity.types.length / 5, 1) * weights.typeCount;

        return confidenceScore + attributeScore + mentionScore + typeScore;
      })
    ),
  }),
}) {}
