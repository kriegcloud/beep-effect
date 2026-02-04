/**
 * SameAsLinker - owl:sameAs provenance link generation
 *
 * Generates owl:sameAs links between entities in the same cluster
 * for provenance tracking and knowledge graph integration.
 *
 * @module knowledge-server/EntityResolution/SameAsLinker
 * @since 0.1.0
 */

import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Iterable from "effect/Iterable";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { EntityCluster } from "./EntityClusterer";

const $I = $KnowledgeServerId.create("EntityResolution/SameAsLinker");
// =============================================================================
// Types
// =============================================================================

/**
 * owl:sameAs provenance link between entities
 *
 * @since 0.1.0
 * @category types
 */
export class SameAsLink extends S.Class<SameAsLink>($I`SameAsLink`)({
  ...Entities.SameAsLink.Model.select.pick("id", "canonicalId", "memberId", "confidence").fields,
  sourceId: S.optional(S.String),
}) {}

/**
 * Result of transitive closure computation
 */
interface TransitiveClosure {
  readonly canonical: string;
  readonly members: readonly string[];
}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * SameAsLinker Service
 *
 * Generates owl:sameAs provenance links from entity clusters and provides
 * utilities for querying transitive same-as relationships.
 *
 * @example
 * ```ts
 * import { SameAsLinker } from "@beep/knowledge-server/EntityResolution";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const linker = yield* SameAsLinker;
 *   const links = yield* linker.generateLinks(clusters, confidenceMap);
 *
 *   console.log(`Generated ${links.length} same-as links`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class SameAsLinker extends Effect.Service<SameAsLinker>()($I`SameAsLinker`, {
  accessors: true,
  effect: Effect.succeed({
    /**
     * Generate owl:sameAs links from entity clusters
     *
     * Creates a link from each non-canonical member to the canonical entity.
     *
     * @param clusters - Entity clusters from clustering
     * @param entityConfidences - Map of entity ID to confidence score
     * @returns Array of same-as links
     */
    generateLinks: Effect.fn(
      (
        clusters: readonly EntityCluster[],
        entityConfidences: MutableHashMap.MutableHashMap<string, number>
      ) =>
        Effect.gen(function* () {
        const links = A.empty<SameAsLink>();

        yield* Effect.logDebug("SameAsLinker.generateLinks: starting", {
          clusterCount: clusters.length,
        });

        for (const cluster of clusters) {
          // Skip singleton clusters (no links needed)
          if (cluster.memberIds.length <= 1) {
            continue;
          }

          for (const memberId of cluster.memberIds) {
            // Don't create self-link for canonical
            if (memberId === cluster.canonicalEntityId) {
              continue;
            }

            const confidence = O.getOrElse(MutableHashMap.get(entityConfidences, memberId), () => cluster.cohesion);

            links.push({
              id: KnowledgeEntityIds.SameAsLinkId.create(),
              canonicalId: cluster.canonicalEntityId,
              memberId,
              confidence,
            });
          }
        }

        yield* Effect.logInfo("SameAsLinker.generateLinks: complete", {
          linkCount: links.length,
          clusterCount: clusters.length,
        });

        return links;
      })
    ),

    /**
     * Generate links with source provenance
     *
     * Similar to generateLinks but includes source document/extraction IDs.
     *
     * @param clusters - Entity clusters
     * @param entityConfidences - Confidence scores
     * @param entitySources - Map of entity ID to source ID
     * @returns Links with source provenance
     */
    generateLinksWithProvenance: Effect.fn(
      (
        clusters: readonly EntityCluster[],
        entityConfidences: MutableHashMap.MutableHashMap<string, number>,
        entitySources: MutableHashMap.MutableHashMap<string, string>
      ) =>
        Effect.gen(function* () {
        const links = A.empty<SameAsLink>();

        for (const cluster of clusters) {
          if (cluster.memberIds.length <= 1) continue;

          for (const memberId of cluster.memberIds) {
            if (memberId === cluster.canonicalEntityId) continue;

            const confidence = O.getOrElse(MutableHashMap.get(entityConfidences, memberId), () => cluster.cohesion);
            const sourceIdOpt = MutableHashMap.get(entitySources, memberId);

            links.push({
              id: KnowledgeEntityIds.SameAsLinkId.create(),
              canonicalId: cluster.canonicalEntityId,
              memberId,
              confidence,
              ...(O.isSome(sourceIdOpt) && { sourceId: sourceIdOpt.value }),
            });
          }
        }

        return links;
      })
    ),

    /**
     * Check if two entities are transitively same-as
     *
     * Computes transitive closure to determine if entities are linked.
     *
     * @param entityA - First entity ID
     * @param entityB - Second entity ID
     * @param links - Same-as links to traverse
     * @returns True if entities are transitively linked
     */
    areLinked: Effect.fn((entityA: string, entityB: string, links: readonly SameAsLink[]) =>
      Effect.sync(() => {
        if (entityA === entityB) return true;

        // Build canonical mapping (member -> canonical)
        const canonicalMap = MutableHashMap.empty<string, string>();
        for (const link of links) {
          MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
        }

        // Find canonical for each entity
        const getCanonical = (id: string): string => {
          let current = id;
          const visited = MutableHashSet.empty<string>();

          while (MutableHashMap.has(canonicalMap, current) && !MutableHashSet.has(visited, current)) {
            MutableHashSet.add(visited, current);
            current = O.getOrThrow(MutableHashMap.get(canonicalMap, current));
          }

          return current;
        };

        return getCanonical(entityA) === getCanonical(entityB);
      })
    ),

    /**
     * Get canonical entity for a given entity
     *
     * Follows same-as links to find the canonical representative.
     *
     * @param entityId - Entity to find canonical for
     * @param links - Same-as links
     * @returns Canonical entity ID (or self if no links)
     */
    getCanonical: Effect.fn((entityId: string, links: readonly SameAsLink[]) =>
      Effect.sync(() => {
        const canonicalMap = MutableHashMap.empty<string, string>();
        for (const link of links) {
          MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
        }

        let current = entityId;
        const visited = MutableHashSet.empty<string>();

        while (MutableHashMap.has(canonicalMap, current) && !MutableHashSet.has(visited, current)) {
          MutableHashSet.add(visited, current);
          current = O.getOrThrow(MutableHashMap.get(canonicalMap, current));
        }

        return current;
      })
    ),

    /**
     * Compute transitive closure for all entities
     *
     * Groups all entities by their canonical representative.
     *
     * @param links - Same-as links
     * @returns Array of canonical entities with their members
     */
    computeTransitiveClosure: Effect.fn((links: readonly SameAsLink[]) =>
      Effect.sync(() => {
        // Build canonical mapping
        const canonicalMap = MutableHashMap.empty<string, string>();
        for (const link of links) {
          MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
        }

        // Find root canonical for each entity
        const getCanonical = (id: string): string => {
          let current = id;
          const visited = MutableHashSet.empty<string>();

          while (MutableHashMap.has(canonicalMap, current) && !MutableHashSet.has(visited, current)) {
            MutableHashSet.add(visited, current);
            current = O.getOrThrow(MutableHashMap.get(canonicalMap, current));
          }

          return current;
        };

        // Group by canonical
        const groups = MutableHashMap.empty<string, string[]>();

        // Collect all entity IDs
        const allEntities = MutableHashSet.empty<string>();
        for (const link of links) {
          MutableHashSet.add(allEntities, link.canonicalId);
          MutableHashSet.add(allEntities, link.memberId);
        }

        Iterable.forEach(allEntities, (entityId) => {
          const canonical = getCanonical(entityId);
          const group = O.getOrElse(MutableHashMap.get(groups, canonical), () => [] as string[]);
          if (!A.contains(group, entityId)) {
            group.push(entityId);
          }
          MutableHashMap.set(groups, canonical, group);
        });

        const result = A.empty<TransitiveClosure>();
        MutableHashMap.forEach(groups, (members, canonical) => {
          result.push({ canonical, members });
        });
        return result;
      })
    ),

    /**
     * Validate links for consistency
     *
     * Checks for cycles and orphaned references.
     *
     * @param links - Links to validate
     * @returns Validation result with any issues found
     */
    validateLinks: Effect.fn((links: readonly SameAsLink[]) =>
      Effect.sync(() => {
        const issues = A.empty<string>();

        // Check for self-links
        for (const link of links) {
          if (link.canonicalId === link.memberId) {
            issues.push(`Self-link detected: ${link.id}`);
          }
        }

        // Check for cycles
        const canonicalMap = MutableHashMap.empty<string, string>();
        for (const link of links) {
          MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
        }

        for (const link of links) {
          const visited = MutableHashSet.empty<string>();
          let current = link.canonicalId;

          while (MutableHashMap.has(canonicalMap, current)) {
            if (MutableHashSet.has(visited, current)) {
              issues.push(`Cycle detected involving: ${current}`);
              break;
            }
            MutableHashSet.add(visited, current);
            current = O.getOrThrow(MutableHashMap.get(canonicalMap, current));
          }
        }

        // Check for duplicate links
        const linkKeys = MutableHashSet.empty<string>();
        for (const link of links) {
          const key = `${link.canonicalId}:${link.memberId}`;
          if (MutableHashSet.has(linkKeys, key)) {
            issues.push(`Duplicate link: ${link.canonicalId} -> ${link.memberId}`);
          }
          MutableHashSet.add(linkKeys, key);
        }

        return {
          valid: A.isEmptyReadonlyArray(issues),
          issues,
        };
      })
    ),
  }),
}) {}
