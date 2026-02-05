import { $KnowledgeServerId } from "@beep/identity/packages";
import type { CanonicalSelectionError } from "@beep/knowledge-domain/errors";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";

import * as Str from "effect/String";
import type { AssembledEntity, AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { CanonicalSelector, type CanonicalSelectorConfig, CanonicalSelectorLive } from "./CanonicalSelector";
import { type ClusterConfig, type EntityCluster, EntityClusterer, EntityClustererLive } from "./EntityClusterer";
import { type SameAsLink, SameAsLinker, SameAsLinkerLive } from "./SameAsLinker";

const $I = $KnowledgeServerId.create("EntityResolution/EntityResolutionService");

export type { EntityCluster } from "./EntityClusterer";

export interface ResolutionConfig {
  readonly clustering?: undefined | ClusterConfig;
  readonly canonical?: undefined | CanonicalSelectorConfig;
}

export interface ResolutionResult {
  readonly graph: KnowledgeGraph;
  readonly clusters: readonly EntityCluster[];
  readonly sameAsLinks: readonly SameAsLink[];
  readonly stats: {
    readonly originalEntityCount: number;
    readonly resolvedEntityCount: number;
    readonly clusterCount: number;
    readonly sameAsLinkCount: number;
    readonly averageClusterSize: number;
    readonly maxClusterSize: number;
    readonly mergedEntityCount: number;
  };
}

const buildResolvedGraph = (
  graphs: readonly KnowledgeGraph[],
  canonicalEntities: readonly AssembledEntity[],
  clusters: readonly EntityCluster[]
): KnowledgeGraph => {
  const idMapping = MutableHashMap.empty<string, string>();
  A.forEach(clusters, (cluster) => {
    A.forEach(cluster.memberIds, (memberId) => {
      MutableHashMap.set(idMapping, memberId, cluster.canonicalEntityId);
    });
  });

  const canonicalById = MutableHashMap.empty<string, AssembledEntity>();
  A.forEach(canonicalEntities, (entity) => {
    MutableHashMap.set(canonicalById, entity.id, entity);
  });

  const relationSet = MutableHashSet.empty<string>();
  const resolvedRelations = A.empty<AssembledRelation>();

  A.forEach(graphs, (graph) => {
    A.forEach(graph.relations, (relation) => {
      const mappedSubjectId = O.getOrElse(MutableHashMap.get(idMapping, relation.subjectId), () => relation.subjectId);
      const mappedObjectId = relation.objectId
        ? O.getOrElse(MutableHashMap.get(idMapping, relation.objectId), () => relation.objectId)
        : undefined;

      if (!MutableHashMap.has(canonicalById, mappedSubjectId)) return;
      if (mappedObjectId && !MutableHashMap.has(canonicalById, mappedObjectId)) return;

      const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

      if (!MutableHashSet.has(relationSet, key)) {
        MutableHashSet.add(relationSet, key);
        resolvedRelations.push({
          ...relation,
          subjectId: mappedSubjectId,
          ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
        });
      }
    });
  });

  const entityIndex: Record<string, string> = {};
  A.forEach(canonicalEntities, (entity) => {
    const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
    entityIndex[key] = entity.id;

    const mentionKey = Str.toLowerCase(entity.mention);
    if (!(mentionKey in entityIndex)) {
      entityIndex[mentionKey] = entity.id;
    }
  });

  return {
    entities: canonicalEntities,
    relations: resolvedRelations,
    entityIndex,
    stats: {
      entityCount: A.length(canonicalEntities),
      relationCount: A.length(resolvedRelations),
      unresolvedSubjects: 0,
      unresolvedObjects: 0,
    },
  };
};

export interface EntityResolutionServiceShape {
  readonly resolve: (
    graphs: readonly KnowledgeGraph[],
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string,
    config?: ResolutionConfig
  ) => Effect.Effect<ResolutionResult, CanonicalSelectionError>;
}

export class EntityResolutionService extends Context.Tag($I`EntityResolutionService`)<
  EntityResolutionService,
  EntityResolutionServiceShape
>() {}

const serviceEffect: Effect.Effect<
  EntityResolutionServiceShape,
  never,
  EntityClusterer | CanonicalSelector | SameAsLinker
> = Effect.gen(function* () {
  const clusterer = yield* EntityClusterer;
  const canonicalSelector = yield* CanonicalSelector;
  const sameAsLinker = yield* SameAsLinker;

  const resolve = Effect.fn(
    (
      graphs: readonly KnowledgeGraph[],
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string,
      config: ResolutionConfig = {}
    ) =>
      Effect.gen(function* () {
        const originalCount = A.reduce(
          A.map(graphs, (g) => A.length(g.entities)),
          0,
          (sum, count) => sum + count
        );

        if (originalCount === 0) {
          yield* Effect.logDebug("EntityResolutionService.resolve: no entities to resolve");
          return {
            graph: {
              entities: A.empty<AssembledEntity>(),
              relations: A.empty<AssembledRelation>(),
              entityIndex: {},
              stats: {
                entityCount: 0,
                relationCount: 0,
                unresolvedSubjects: 0,
                unresolvedObjects: 0,
              },
            },
            clusters: A.empty<EntityCluster>(),
            sameAsLinks: A.empty<SameAsLink>(),
            stats: {
              originalEntityCount: 0,
              resolvedEntityCount: 0,
              clusterCount: 0,
              sameAsLinkCount: 0,
              averageClusterSize: 0,
              maxClusterSize: 0,
              mergedEntityCount: 0,
            },
          };
        }

        yield* Effect.logInfo("EntityResolutionService.resolve: starting").pipe(
          Effect.annotateLogs({
            graphCount: A.length(graphs),
            originalEntityCount: originalCount,
          })
        );

        const clusters = yield* clusterer.cluster(graphs, organizationId, ontologyId, config.clustering);

        const entityById = MutableHashMap.empty<string, AssembledEntity>();
        A.forEach(graphs, (graph) => {
          A.forEach(graph.entities, (entity) => {
            MutableHashMap.set(entityById, entity.id, entity);
          });
        });

        const canonicalEntities = A.empty<AssembledEntity>();
        const updatedClusters = A.empty<EntityCluster>();

        for (const cluster of clusters) {
          const members = A.filterMap(cluster.memberIds, (id) => MutableHashMap.get(entityById, id));

          if (A.isEmptyReadonlyArray(members)) continue;

          const canonical = yield* canonicalSelector.selectCanonical(members, config.canonical);

          const otherMembers = A.filter(members, (m) => m.id !== canonical.id);
          const mergedCanonical = yield* canonicalSelector.mergeAttributes(canonical, otherMembers);

          canonicalEntities.push(mergedCanonical);

          updatedClusters.push({
            ...cluster,
            canonicalEntityId: canonical.id,
          });
        }

        const confidenceMap = MutableHashMap.empty<string, number>();
        MutableHashMap.forEach(entityById, (entity) => {
          MutableHashMap.set(confidenceMap, entity.id, entity.confidence);
        });

        const sameAsLinks = yield* sameAsLinker.generateLinks(updatedClusters, confidenceMap);

        const resolvedGraph = buildResolvedGraph(graphs, canonicalEntities, updatedClusters);

        const clusterMemberLengths = A.map(updatedClusters, (c) => A.length(c.memberIds));
        const maxClusterSize = A.isNonEmptyReadonlyArray(clusterMemberLengths) ? Math.max(...clusterMemberLengths) : 0;
        const totalMembers = A.reduce(clusterMemberLengths, 0, (sum, len) => sum + len);
        const averageClusterSize = A.isNonEmptyReadonlyArray(updatedClusters)
          ? totalMembers / A.length(updatedClusters)
          : 0;

        const result: ResolutionResult = {
          graph: resolvedGraph,
          clusters: updatedClusters,
          sameAsLinks,
          stats: {
            originalEntityCount: originalCount,
            resolvedEntityCount: A.length(canonicalEntities),
            clusterCount: A.length(updatedClusters),
            sameAsLinkCount: A.length(sameAsLinks),
            averageClusterSize,
            maxClusterSize,
            mergedEntityCount: originalCount - A.length(canonicalEntities),
          },
        };

        yield* Effect.logInfo("EntityResolutionService.resolve: complete").pipe(Effect.annotateLogs(result.stats));

        return result;
      }).pipe(
        Effect.withSpan("EntityResolutionService.resolve", {
          captureStackTrace: false,
          attributes: {
            graphCount: A.length(graphs),
          },
        })
      )
  );

  return EntityResolutionService.of({
    resolve,
  });
});

export const EntityResolutionServiceLive = Layer.effect(EntityResolutionService, serviceEffect).pipe(
  Layer.provide(EntityClustererLive),
  Layer.provide(CanonicalSelectorLive),
  Layer.provide(SameAsLinkerLive)
);
