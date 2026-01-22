/**
 * SameAsLinker - owl:sameAs provenance link generation
 *
 * Generates owl:sameAs links between entities in the same cluster
 * for provenance tracking and knowledge graph integration.
 *
 * @module knowledge-server/EntityResolution/SameAsLinker
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type { EntityCluster } from "./EntityClusterer";
// =============================================================================
// Types
// =============================================================================

/**
 * owl:sameAs provenance link between entities
 *
 * @since 0.1.0
 * @category types
 */
export interface SameAsLink {
  /**
   * Link ID
   */
  readonly id: string;

  /**
   * Canonical entity IRI/ID
   */
  readonly canonicalId: string;

  /**
   * Member entity IRI/ID that is "same as" canonical
   */
  readonly memberId: string;

  /**
   * Confidence score for this link (0-1)
   */
  readonly confidence: number;

  /**
   * Source of the member entity (extraction/document ID)
   */
  readonly sourceId?: undefined | string;
}

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
export class SameAsLinker extends Effect.Service<SameAsLinker>()("@beep/knowledge-server/SameAsLinker", {
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
    generateLinks: (
      clusters: readonly EntityCluster[],
      entityConfidences: Map<string, number>
    ): Effect.Effect<readonly SameAsLink[]> =>
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

            const confidence = entityConfidences.get(memberId) ?? cluster.cohesion;

            links.push({
              id: `knowledge_same_as_link__${crypto.randomUUID()}`,
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
      }),

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
    generateLinksWithProvenance: (
      clusters: readonly EntityCluster[],
      entityConfidences: Map<string, number>,
      entitySources: Map<string, string>
    ): Effect.Effect<readonly SameAsLink[]> =>
      Effect.gen(function* () {
        const links = A.empty<SameAsLink>();

        for (const cluster of clusters) {
          if (cluster.memberIds.length <= 1) continue;

          for (const memberId of cluster.memberIds) {
            if (memberId === cluster.canonicalEntityId) continue;

            const confidence = entityConfidences.get(memberId) ?? cluster.cohesion;
            const sourceId = entitySources.get(memberId);

            links.push({
              id: `knowledge_same_as_link__${crypto.randomUUID()}`,
              canonicalId: cluster.canonicalEntityId,
              memberId,
              confidence,
              ...(sourceId !== undefined && { sourceId }),
            });
          }
        }

        return links;
      }),

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
    areLinked: (entityA: string, entityB: string, links: readonly SameAsLink[]): Effect.Effect<boolean> =>
      Effect.sync(() => {
        if (entityA === entityB) return true;

        // Build canonical mapping (member -> canonical)
        const canonicalMap = new Map<string, string>();
        for (const link of links) {
          canonicalMap.set(link.memberId, link.canonicalId);
        }

        // Find canonical for each entity
        const getCanonical = (id: string): string => {
          let current = id;
          const visited = new Set<string>();

          while (canonicalMap.has(current) && !visited.has(current)) {
            visited.add(current);
            current = canonicalMap.get(current)!;
          }

          return current;
        };

        return getCanonical(entityA) === getCanonical(entityB);
      }),

    /**
     * Get canonical entity for a given entity
     *
     * Follows same-as links to find the canonical representative.
     *
     * @param entityId - Entity to find canonical for
     * @param links - Same-as links
     * @returns Canonical entity ID (or self if no links)
     */
    getCanonical: (entityId: string, links: readonly SameAsLink[]): Effect.Effect<string> =>
      Effect.sync(() => {
        const canonicalMap = new Map<string, string>();
        for (const link of links) {
          canonicalMap.set(link.memberId, link.canonicalId);
        }

        let current = entityId;
        const visited = new Set<string>();

        while (canonicalMap.has(current) && !visited.has(current)) {
          visited.add(current);
          current = canonicalMap.get(current)!;
        }

        return current;
      }),

    /**
     * Compute transitive closure for all entities
     *
     * Groups all entities by their canonical representative.
     *
     * @param links - Same-as links
     * @returns Array of canonical entities with their members
     */
    computeTransitiveClosure: (links: readonly SameAsLink[]): Effect.Effect<readonly TransitiveClosure[]> =>
      Effect.sync(() => {
        // Build canonical mapping
        const canonicalMap = new Map<string, string>();
        for (const link of links) {
          canonicalMap.set(link.memberId, link.canonicalId);
        }

        // Find root canonical for each entity
        const getCanonical = (id: string): string => {
          let current = id;
          const visited = new Set<string>();

          while (canonicalMap.has(current) && !visited.has(current)) {
            visited.add(current);
            current = canonicalMap.get(current)!;
          }

          return current;
        };

        // Group by canonical
        const groups = new Map<string, string[]>();

        // Collect all entity IDs
        const allEntities = new Set<string>();
        for (const link of links) {
          allEntities.add(link.canonicalId);
          allEntities.add(link.memberId);
        }

        for (const entityId of allEntities) {
          const canonical = getCanonical(entityId);
          const group = groups.get(canonical) ?? [];
          if (!group.includes(entityId)) {
            group.push(entityId);
          }
          groups.set(canonical, group);
        }

        return Array.from(groups.entries()).map(([canonical, members]) => ({
          canonical,
          members,
        }));
      }),

    /**
     * Validate links for consistency
     *
     * Checks for cycles and orphaned references.
     *
     * @param links - Links to validate
     * @returns Validation result with any issues found
     */
    validateLinks: (links: readonly SameAsLink[]): Effect.Effect<{ valid: boolean; issues: readonly string[] }> =>
      Effect.sync(() => {
        const issues = A.empty<string>();

        // Check for self-links
        for (const link of links) {
          if (link.canonicalId === link.memberId) {
            issues.push(`Self-link detected: ${link.id}`);
          }
        }

        // Check for cycles
        const canonicalMap = new Map<string, string>();
        for (const link of links) {
          canonicalMap.set(link.memberId, link.canonicalId);
        }

        for (const link of links) {
          const visited = new Set<string>();
          let current = link.canonicalId;

          while (canonicalMap.has(current)) {
            if (visited.has(current)) {
              issues.push(`Cycle detected involving: ${current}`);
              break;
            }
            visited.add(current);
            current = canonicalMap.get(current)!;
          }
        }

        // Check for duplicate links
        const linkKeys = new Set<string>();
        for (const link of links) {
          const key = `${link.canonicalId}:${link.memberId}`;
          if (linkKeys.has(key)) {
            issues.push(`Duplicate link: ${link.canonicalId} -> ${link.memberId}`);
          }
          linkKeys.add(key);
        }

        return {
          valid: issues.length === 0,
          issues,
        };
      }),
  }),
}) {}
