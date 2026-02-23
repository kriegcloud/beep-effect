# Phase 4 Handoff: Entity Resolution

**Date**: 2026-01-19
**From**: Phase 3 (Embedding & Grounding)
**To**: Phase 4 (Entity Resolution)
**Status**: Ready for implementation

---

## Phase 3 Completion Summary

Phase 3 successfully implemented embedding generation and grounding verification:

### Files Created

| Category | Files |
|----------|-------|
| Embedding Provider | `packages/knowledge/server/src/Embedding/EmbeddingProvider.ts` |
| Embedding Service | `packages/knowledge/server/src/Embedding/EmbeddingService.ts` |
| Mock Provider | `packages/knowledge/server/src/Embedding/providers/MockProvider.ts` |
| OpenAI Provider | `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts` |
| Grounding Service | `packages/knowledge/server/src/Grounding/GroundingService.ts` |
| Confidence Filter | `packages/knowledge/server/src/Grounding/ConfidenceFilter.ts` |
| Repository Extensions | `packages/knowledge/server/src/db/repos/Embedding.repo.ts` (updated) |

### Key Patterns Established

| Pattern | Implementation | Notes |
|---------|----------------|-------|
| EmbeddingProvider | Context.GenericTag interface | Pluggable backends (Mock, OpenAI) |
| EmbeddingService | Effect.Service with caching | pgvector storage, batch operations |
| GroundingService | Similarity-based verification | Cosine similarity against source text |
| ConfidenceFilter | Threshold-based filtering | Configurable entity/relation thresholds |
| pgvector Search | findSimilar in Embedding.repo | Returns SimilarityResult with scores |

### APIs Available for Phase 4

```typescript
// From EmbeddingService
interface EmbeddingService {
  embed: (
    text: string,
    taskType: TaskType,
    organizationId: string,
    ontologyId: string
  ) => Effect<ReadonlyArray<number>, EmbeddingError>;

  embedEntities: (
    entities: ReadonlyArray<AssembledEntity>,
    organizationId: string,
    ontologyId: string
  ) => Effect<void, EmbeddingError>;

  findSimilar: (
    queryVector: ReadonlyArray<number>,
    organizationId: string,
    limit?: number,
    threshold?: number
  ) => Effect<ReadonlyArray<SimilarityResult>, EmbeddingError>;

  getOrCreate: (
    text: string,
    taskType: TaskType,
    organizationId: string,
    ontologyId: string
  ) => Effect<ReadonlyArray<number>, EmbeddingError>;
}

// From GroundingService
interface GroundingResult {
  readonly groundedRelations: readonly AssembledRelation[];
  readonly ungroundedRelations: readonly AssembledRelation[];
  readonly stats: {
    readonly total: number;
    readonly grounded: number;
    readonly ungrounded: number;
    readonly averageConfidence: number;
  };
}

// From ConfidenceFilter
interface FilterResult {
  readonly graph: KnowledgeGraph;
  readonly stats: FilterStats;
}

// From Embedding.repo
interface SimilarityResult {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly contentText: string | null;
  readonly similarity: number;
}
```

---

## Phase 4 Scope

Phase 4 implements entity resolution to deduplicate and link entities across multiple extractions.

### Primary Objectives

1. **EntityClusterer**: Group similar entities using embedding similarity
2. **CanonicalSelector**: Select the best representative for each cluster
3. **SameAsLinker**: Create owl:sameAs provenance links between merged entities
4. **CrossSourceMatcher**: Handle entities extracted from different documents/sources
5. **ResolutionPersistence**: Store clusters and links in database

### Integration Points

```
ExtractionPipeline.run() for Document A
    → KnowledgeGraph A
ExtractionPipeline.run() for Document B
    → KnowledgeGraph B
        → EntityResolutionService.resolve([Graph A, Graph B])
            → Deduplicated KnowledgeGraph with owl:sameAs links
            → Canonical entities selected
            → Cross-source matches identified
```

---

## Required Files to Create

### 1. Entity Resolution Service

```
packages/knowledge/server/src/EntityResolution/
├── EntityResolutionService.ts   # Main service orchestrating resolution
├── EntityClusterer.ts           # Similarity-based clustering
├── CanonicalSelector.ts         # Canonical entity selection strategies
├── SameAsLinker.ts              # owl:sameAs link generation
├── CrossSourceMatcher.ts        # Cross-document entity matching
└── index.ts
```

### 2. Domain Models

```
packages/knowledge/domain/src/entities/EntityCluster/
├── EntityCluster.model.ts       # Cluster with canonical + members
└── index.ts

packages/knowledge/domain/src/entities/SameAsLink/
├── SameAsLink.model.ts          # owl:sameAs provenance link
└── index.ts
```

### 3. Repository Updates

```
packages/knowledge/server/src/db/repos/
├── Entity.repo.ts               # Add cluster-related queries
├── EntityCluster.repo.ts        # NEW: Cluster persistence
└── SameAsLink.repo.ts           # NEW: Link persistence
```

### 4. Table Schemas

```
packages/knowledge/tables/src/tables/
├── entityCluster.table.ts       # NEW: Cluster table
└── sameAsLink.table.ts          # NEW: Link table
```

---

## Implementation Guidance

### EntityClusterer

```typescript
// packages/knowledge/server/src/EntityResolution/EntityClusterer.ts
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import type { AssembledEntity, KnowledgeGraph } from "../Extraction/GraphAssembler";

export interface ClusterConfig {
  /**
   * Minimum similarity to consider entities as potential matches
   * @default 0.85
   */
  readonly similarityThreshold?: number;

  /**
   * Maximum cluster size before splitting
   * @default 50
   */
  readonly maxClusterSize?: number;

  /**
   * Whether to use type compatibility as constraint
   * @default true
   */
  readonly requireTypeCompatibility?: boolean;
}

export interface EntityCluster {
  /**
   * Cluster ID
   */
  readonly id: string;

  /**
   * Canonical entity (selected representative)
   */
  readonly canonicalEntityId: string;

  /**
   * All member entity IDs
   */
  readonly memberIds: readonly string[];

  /**
   * Average internal similarity
   */
  readonly cohesion: number;

  /**
   * Shared type IRIs
   */
  readonly sharedTypes: readonly string[];
}

export class EntityClusterer extends Effect.Service<EntityClusterer>()(
  "@beep/knowledge-server/EntityClusterer",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const embedding = yield* EmbeddingService;

      return {
        /**
         * Cluster entities by embedding similarity
         */
        cluster: (
          graphs: readonly KnowledgeGraph[],
          organizationId: string,
          ontologyId: string,
          config: ClusterConfig = {}
        ): Effect.Effect<readonly EntityCluster[]> =>
          Effect.gen(function* () {
            const threshold = config.similarityThreshold ?? 0.85;

            // Collect all entities
            const allEntities = graphs.flatMap(g => g.entities);

            yield* Effect.logInfo("EntityClusterer.cluster: starting", {
              entityCount: allEntities.length,
              threshold,
            });

            // Build similarity graph
            const similarities = yield* computeSimilarityMatrix(
              allEntities,
              organizationId,
              ontologyId,
              threshold,
              config.requireTypeCompatibility ?? true
            );

            // Agglomerative clustering
            const clusters = yield* agglomerativeClustering(
              allEntities,
              similarities,
              config.maxClusterSize ?? 50
            );

            yield* Effect.logInfo("EntityClusterer.cluster: complete", {
              clusterCount: clusters.length,
            });

            return clusters;
          }),
      };
    }),
  }
) {}
```

### CanonicalSelector

```typescript
// packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts
import * as Effect from "effect/Effect";
import type { AssembledEntity } from "../Extraction/GraphAssembler";
import type { EntityCluster } from "./EntityClusterer";

export type SelectionStrategy = "highest_confidence" | "most_attributes" | "most_mentions" | "hybrid";

export interface CanonicalSelectorConfig {
  /**
   * Selection strategy
   * @default "hybrid"
   */
  readonly strategy?: SelectionStrategy;

  /**
   * Weights for hybrid strategy
   */
  readonly weights?: {
    readonly confidence?: number;
    readonly attributeCount?: number;
    readonly mentionCount?: number;
  };
}

export class CanonicalSelector extends Effect.Service<CanonicalSelector>()(
  "@beep/knowledge-server/CanonicalSelector",
  {
    accessors: true,
    effect: Effect.succeed({
      /**
       * Select canonical entity for a cluster
       */
      selectCanonical: (
        cluster: readonly AssembledEntity[],
        config: CanonicalSelectorConfig = {}
      ): Effect.Effect<AssembledEntity> =>
        Effect.gen(function* () {
          const strategy = config.strategy ?? "hybrid";

          switch (strategy) {
            case "highest_confidence":
              return selectByConfidence(cluster);
            case "most_attributes":
              return selectByAttributeCount(cluster);
            case "most_mentions":
              return selectByMentionCount(cluster);
            case "hybrid":
            default:
              return selectHybrid(cluster, config.weights ?? {});
          }
        }),

      /**
       * Merge attributes from cluster members into canonical
       */
      mergeAttributes: (
        canonical: AssembledEntity,
        members: readonly AssembledEntity[]
      ): Effect.Effect<AssembledEntity> =>
        Effect.sync(() => {
          const mergedAttributes = { ...canonical.attributes };

          for (const member of members) {
            for (const [key, value] of Object.entries(member.attributes)) {
              if (!(key in mergedAttributes)) {
                mergedAttributes[key] = value;
              }
            }
          }

          return {
            ...canonical,
            attributes: mergedAttributes,
          };
        }),
    }),
  }
) {}
```

### SameAsLinker

```typescript
// packages/knowledge/server/src/EntityResolution/SameAsLinker.ts
import * as Effect from "effect/Effect";
import type { EntityCluster } from "./EntityClusterer";

export interface SameAsLink {
  /**
   * Link ID
   */
  readonly id: string;

  /**
   * Canonical entity IRI
   */
  readonly canonicalId: string;

  /**
   * Member entity IRI that is "same as" canonical
   */
  readonly memberId: string;

  /**
   * Similarity score that led to linking
   */
  readonly confidence: number;

  /**
   * Source of the member entity (document/extraction ID)
   */
  readonly sourceId?: string;
}

export class SameAsLinker extends Effect.Service<SameAsLinker>()(
  "@beep/knowledge-server/SameAsLinker",
  {
    accessors: true,
    effect: Effect.succeed({
      /**
       * Generate owl:sameAs links from clusters
       */
      generateLinks: (
        clusters: readonly EntityCluster[],
        entityConfidences: Map<string, number>
      ): Effect.Effect<readonly SameAsLink[]> =>
        Effect.sync(() => {
          const links: SameAsLink[] = [];

          for (const cluster of clusters) {
            for (const memberId of cluster.memberIds) {
              if (memberId !== cluster.canonicalEntityId) {
                links.push({
                  id: `knowledge_same_as__${crypto.randomUUID()}`,
                  canonicalId: cluster.canonicalEntityId,
                  memberId,
                  confidence: entityConfidences.get(memberId) ?? cluster.cohesion,
                });
              }
            }
          }

          return links;
        }),

      /**
       * Check if two entities are transitively same-as
       */
      areLinked: (
        entityA: string,
        entityB: string,
        links: readonly SameAsLink[]
      ): Effect.Effect<boolean> =>
        Effect.sync(() => {
          // Build transitive closure
          const canonicalMap = new Map<string, string>();
          for (const link of links) {
            canonicalMap.set(link.memberId, link.canonicalId);
          }

          const getCanonical = (id: string): string =>
            canonicalMap.get(id) ?? id;

          return getCanonical(entityA) === getCanonical(entityB);
        }),
    }),
  }
) {}
```

### EntityResolutionService

```typescript
// packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EntityClusterer, type ClusterConfig, type EntityCluster } from "./EntityClusterer";
import { CanonicalSelector, type CanonicalSelectorConfig } from "./CanonicalSelector";
import { SameAsLinker, type SameAsLink } from "./SameAsLinker";
import type { KnowledgeGraph, AssembledEntity } from "../Extraction/GraphAssembler";

export interface ResolutionConfig {
  readonly clustering?: ClusterConfig;
  readonly canonical?: CanonicalSelectorConfig;
}

export interface ResolutionResult {
  /**
   * Resolved graph with deduplicated entities
   */
  readonly graph: KnowledgeGraph;

  /**
   * Entity clusters
   */
  readonly clusters: readonly EntityCluster[];

  /**
   * owl:sameAs provenance links
   */
  readonly sameAsLinks: readonly SameAsLink[];

  /**
   * Statistics
   */
  readonly stats: {
    readonly originalEntityCount: number;
    readonly resolvedEntityCount: number;
    readonly clusterCount: number;
    readonly sameAsLinkCount: number;
    readonly averageClusterSize: number;
  };
}

export class EntityResolutionService extends Effect.Service<EntityResolutionService>()(
  "@beep/knowledge-server/EntityResolutionService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const clusterer = yield* EntityClusterer;
      const canonicalSelector = yield* CanonicalSelector;
      const sameAsLinker = yield* SameAsLinker;

      return {
        /**
         * Resolve entities across multiple knowledge graphs
         */
        resolve: (
          graphs: readonly KnowledgeGraph[],
          organizationId: string,
          ontologyId: string,
          config: ResolutionConfig = {}
        ): Effect.Effect<ResolutionResult> =>
          Effect.gen(function* () {
            const originalCount = graphs.reduce(
              (sum, g) => sum + g.entities.length,
              0
            );

            yield* Effect.logInfo("EntityResolutionService.resolve: starting", {
              graphCount: graphs.length,
              originalEntityCount: originalCount,
            });

            // Step 1: Cluster entities
            const clusters = yield* clusterer.cluster(
              graphs,
              organizationId,
              ontologyId,
              config.clustering
            );

            // Step 2: Select canonical entity for each cluster
            const entityById = new Map<string, AssembledEntity>();
            for (const graph of graphs) {
              for (const entity of graph.entities) {
                entityById.set(entity.id, entity);
              }
            }

            const canonicalEntities: AssembledEntity[] = [];
            const updatedClusters: EntityCluster[] = [];

            for (const cluster of clusters) {
              const members = cluster.memberIds
                .map(id => entityById.get(id))
                .filter((e): e is AssembledEntity => e !== undefined);

              if (members.length === 0) continue;

              const canonical = yield* canonicalSelector.selectCanonical(
                members,
                config.canonical
              );

              const mergedCanonical = yield* canonicalSelector.mergeAttributes(
                canonical,
                members.filter(m => m.id !== canonical.id)
              );

              canonicalEntities.push(mergedCanonical);
              updatedClusters.push({
                ...cluster,
                canonicalEntityId: canonical.id,
              });
            }

            // Step 3: Generate sameAs links
            const confidenceMap = new Map<string, number>();
            for (const entity of entityById.values()) {
              confidenceMap.set(entity.id, entity.confidence);
            }

            const sameAsLinks = yield* sameAsLinker.generateLinks(
              updatedClusters,
              confidenceMap
            );

            // Step 4: Build resolved graph
            const resolvedGraph = yield* buildResolvedGraph(
              graphs,
              canonicalEntities,
              updatedClusters
            );

            const result: ResolutionResult = {
              graph: resolvedGraph,
              clusters: updatedClusters,
              sameAsLinks,
              stats: {
                originalEntityCount: originalCount,
                resolvedEntityCount: canonicalEntities.length,
                clusterCount: updatedClusters.length,
                sameAsLinkCount: sameAsLinks.length,
                averageClusterSize:
                  updatedClusters.length > 0
                    ? originalCount / updatedClusters.length
                    : 0,
              },
            };

            yield* Effect.logInfo("EntityResolutionService.resolve: complete", result.stats);

            return result;
          }),
      };
    }),
  }
) {}

export const EntityResolutionServiceLive = EntityResolutionService.Default.pipe(
  Layer.provide(EntityClusterer.Default),
  Layer.provide(CanonicalSelector.Default),
  Layer.provide(SameAsLinker.Default)
);
```

---

## Domain Models to Create

### EntityCluster Model

```typescript
// packages/knowledge/domain/src/entities/EntityCluster/EntityCluster.model.ts
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EntityCluster");

export class Model extends M.Class<Model>($I`EntityClusterModel`)(
  makeFields(KnowledgeEntityIds.EntityClusterId, {
    canonicalEntityId: KnowledgeEntityIds.EntityId,
    memberIds: S.Array(KnowledgeEntityIds.EntityId),
    cohesion: S.Number,
    sharedTypes: S.Array(S.String),
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.String,
  }),
  $I.annotations("EntityClusterModel", {
    description: "Entity cluster with canonical representative",
  })
) {
  static readonly utils = modelKit(Model);
}
```

### SameAsLink Model

```typescript
// packages/knowledge/domain/src/entities/SameAsLink/SameAsLink.model.ts
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/SameAsLink");

export class Model extends M.Class<Model>($I`SameAsLinkModel`)(
  makeFields(KnowledgeEntityIds.SameAsLinkId, {
    canonicalId: KnowledgeEntityIds.EntityId,
    memberId: KnowledgeEntityIds.EntityId,
    confidence: S.Number,
    sourceId: BS.FieldOptionOmittable(S.String),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("SameAsLinkModel", {
    description: "owl:sameAs provenance link between entities",
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

## Table Schemas to Create

### EntityCluster Table

```typescript
// packages/knowledge/tables/src/tables/entityCluster.table.ts
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { entity } from "./entity.table.js";

export const entityCluster = OrgTable.make(KnowledgeEntityIds.EntityClusterId)(
  {
    canonicalEntityId: pg.text("canonical_entity_id").notNull().references(() => entity.id),
    memberIds: pg.text("member_ids").array().notNull(),
    cohesion: pg.real("cohesion").notNull(),
    sharedTypes: pg.text("shared_types").array().notNull(),
    ontologyId: pg.text("ontology_id").notNull(),
  },
  (t) => [
    pg.index("entity_cluster_canonical_idx").on(t.canonicalEntityId),
    pg.index("entity_cluster_org_idx").on(t.organizationId),
  ]
);
```

### SameAsLink Table

```typescript
// packages/knowledge/tables/src/tables/sameAsLink.table.ts
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { entity } from "./entity.table.js";

export const sameAsLink = OrgTable.make(KnowledgeEntityIds.SameAsLinkId)(
  {
    canonicalId: pg.text("canonical_id").notNull().references(() => entity.id),
    memberId: pg.text("member_id").notNull().references(() => entity.id),
    confidence: pg.real("confidence").notNull(),
    sourceId: pg.text("source_id"),
  },
  (t) => [
    pg.index("same_as_canonical_idx").on(t.canonicalId),
    pg.index("same_as_member_idx").on(t.memberId),
    pg.index("same_as_org_idx").on(t.organizationId),
  ]
);
```

---

## Entity ID Extensions

Add to `packages/shared/domain/src/entity-ids/knowledge/ids.ts`:

```typescript
export const EntityClusterId = EntityId.make("knowledge_entity_cluster");
export const SameAsLinkId = EntityId.make("knowledge_same_as_link");
```

---

## Verification Criteria

### Build Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run lint:fix --filter="@beep/knowledge-*"
```

### Unit Test Requirements

- EntityClusterer groups similar entities correctly (similarity > threshold)
- EntityClusterer respects type compatibility when configured
- CanonicalSelector selects correct entity per strategy
- SameAsLinker generates correct provenance links
- Transitive closure of sameAs links computed correctly

### Integration Test Requirements

- Full pipeline: multiple documents → extraction → entity resolution
- Cross-source matching identifies same real-world entities
- Resolved graph maintains referential integrity
- Relations point to canonical entities after resolution

---

## Critical Path Notes

1. **Similarity computation**: Use existing EmbeddingService.findSimilar for entity pairs
2. **Type compatibility**: Entities should share at least one type IRI to be considered for clustering
3. **Cluster quality**: Monitor cohesion scores to tune similarity threshold
4. **Performance**: For large entity sets, consider blocking by type before computing full similarity matrix
5. **Idempotency**: Running resolution multiple times should produce stable results

---

## Related Files for Reference

| Purpose | Path |
|---------|------|
| Embedding Service | `packages/knowledge/server/src/Embedding/EmbeddingService.ts` |
| GraphAssembler | `packages/knowledge/server/src/Extraction/GraphAssembler.ts` |
| Embedding Repo | `packages/knowledge/server/src/db/repos/Embedding.repo.ts` |
| Entity Model | `packages/knowledge/domain/src/entities/Entity/Entity.model.ts` |
| Confidence Filter | `packages/knowledge/server/src/Grounding/ConfidenceFilter.ts` |

---

## Next Phase Preview

Phase 5 (GraphRAG) will:
- Implement k-NN entity search across resolved knowledge graphs
- N-hop subgraph traversal for context assembly
- RRF (Reciprocal Rank Fusion) scoring for relevance ranking
- Format retrieved subgraphs as agent context
