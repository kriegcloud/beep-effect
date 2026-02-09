import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Iterable from "effect/Iterable";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { EntityCluster } from "./EntityClusterer";

const $I = $KnowledgeServerId.create("EntityResolution/SameAsLinker");

export class SameAsLink extends S.Class<SameAsLink>($I`SameAsLink`)({
  ...Entities.SameAsLink.Model.select.pick("id", "canonicalId", "memberId", "confidence").fields,
  sourceId: S.optional(S.String),
}) {}

export class TransitiveClosure extends S.Class<TransitiveClosure>($I`TransitiveClosure`)(
  {
    canonical: S.String,
    members: S.Array(S.String),
  },
  $I.annotations("TransitiveClosure", {
    description: "Transitive closure of a set of entities",
  })
) {}

export interface SameAsLinkerShape {
  readonly generateLinks: (
    clusters: readonly EntityCluster[],
    entityConfidences: MutableHashMap.MutableHashMap<string, number>
  ) => Effect.Effect<SameAsLink[]>;
  readonly generateLinksWithProvenance: (
    clusters: readonly EntityCluster[],
    entityConfidences: MutableHashMap.MutableHashMap<string, number>,
    entitySources: MutableHashMap.MutableHashMap<string, string>
  ) => Effect.Effect<SameAsLink[]>;
  readonly areLinked: (entityA: string, entityB: string, links: readonly SameAsLink[]) => Effect.Effect<boolean>;
  readonly getCanonical: (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    links: readonly SameAsLink[]
  ) => Effect.Effect<string>;
  readonly computeTransitiveClosure: (links: readonly SameAsLink[]) => Effect.Effect<TransitiveClosure[]>;
  readonly validateLinks: (
    links: readonly SameAsLink[]
  ) => Effect.Effect<{ readonly valid: boolean; readonly issues: string[] }>;
}

export class SameAsLinker extends Context.Tag($I`SameAsLinker`)<SameAsLinker, SameAsLinkerShape>() {}

const serviceEffect: Effect.Effect<SameAsLinkerShape> = Effect.succeed({
  generateLinks: Effect.fn(
    (clusters: readonly EntityCluster[], entityConfidences: MutableHashMap.MutableHashMap<string, number>) =>
      Effect.gen(function* () {
        const links = A.empty<SameAsLink>();

        yield* Effect.logDebug("SameAsLinker.generateLinks: starting").pipe(
          Effect.annotateLogs({ clusterCount: A.length(clusters) })
        );

        for (const cluster of clusters) {
          if (A.length(cluster.memberIds) <= 1) {
            continue;
          }

          for (const memberId of cluster.memberIds) {
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

        yield* Effect.logInfo("SameAsLinker.generateLinks: complete").pipe(
          Effect.annotateLogs({
            linkCount: A.length(links),
            clusterCount: A.length(clusters),
          })
        );

        return links;
      })
  ),

  generateLinksWithProvenance: Effect.fn(
    (
      clusters: readonly EntityCluster[],
      entityConfidences: MutableHashMap.MutableHashMap<string, number>,
      entitySources: MutableHashMap.MutableHashMap<string, string>
    ) =>
      Effect.gen(function* () {
        const links = A.empty<SameAsLink>();

        for (const cluster of clusters) {
          if (A.length(cluster.memberIds) <= 1) continue;

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

  areLinked: Effect.fn((entityA: string, entityB: string, links: readonly SameAsLink[]) =>
    Effect.sync(() => {
      if (entityA === entityB) return true;

      const canonicalMap = MutableHashMap.empty<string, string>();
      for (const link of links) {
        MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
      }

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

  getCanonical: Effect.fn((entityId: KnowledgeEntityIds.KnowledgeEntityId.Type, links: readonly SameAsLink[]) =>
    Effect.sync(() => {
      const canonicalMap = MutableHashMap.empty<string, KnowledgeEntityIds.KnowledgeEntityId.Type>();
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

  computeTransitiveClosure: Effect.fn((links: readonly SameAsLink[]) =>
    Effect.sync(() => {
      const canonicalMap = MutableHashMap.empty<string, string>();
      for (const link of links) {
        MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
      }

      const getCanonical = (id: string): string => {
        let current = id;
        const visited = MutableHashSet.empty<string>();

        while (MutableHashMap.has(canonicalMap, current) && !MutableHashSet.has(visited, current)) {
          MutableHashSet.add(visited, current);
          current = O.getOrThrow(MutableHashMap.get(canonicalMap, current));
        }

        return current;
      };

      const groups = MutableHashMap.empty<string, string[]>();

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

  validateLinks: Effect.fn((links: readonly SameAsLink[]) =>
    Effect.sync(() => {
      const issues = A.empty<string>();

      for (const link of links) {
        if (link.canonicalId === link.memberId) {
          issues.push(`Self-link detected: ${link.id}`);
        }
      }

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
});

export const SameAsLinkerLive = Layer.effect(SameAsLinker, serviceEffect);
