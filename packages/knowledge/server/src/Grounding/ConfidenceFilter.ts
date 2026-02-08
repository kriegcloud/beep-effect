import { $KnowledgeServerId } from "@beep/identity/packages";
import { thunkZero } from "@beep/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { type AssembledEntity, type AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";

const $I = $KnowledgeServerId.create("Grounding/ConfidenceFilter");

const KnowledgeGraphSchema = S.typeSchema(KnowledgeGraph);
type KnowledgeGraphModel = S.Schema.Type<typeof KnowledgeGraphSchema>;
type AssembledEntityModel = S.Schema.Type<typeof AssembledEntity>;
type AssembledRelationModel = S.Schema.Type<typeof AssembledRelation>;

export class FilterConfig extends S.Class<FilterConfig>($I`FilterConfig`)(
  {
    entityThreshold: S.optional(S.Number),
    relationThreshold: S.optional(S.Number),
    removeOrphanEntities: S.optional(S.Boolean),
  },
  $I.annotations("FilterConfig", {
    description: "Confidence filtering configuration (entity/relation thresholds and orphan removal behavior).",
  })
) {}

export class FilterStats extends S.Class<FilterStats>($I`FilterStats`)(
  {
    originalEntityCount: S.Number,
    filteredEntityCount: S.Number,
    removedEntityCount: S.Number,
    originalRelationCount: S.Number,
    filteredRelationCount: S.Number,
    removedRelationCount: S.Number,
    orphanEntitiesRemoved: S.Number,
  },
  $I.annotations("FilterStats", {
    description: "Statistics produced by confidence filtering (counts before/after and removals).",
  })
) {}

export class FilterResult extends S.Class<FilterResult>($I`FilterResult`)(
  {
    graph: KnowledgeGraphSchema,
    stats: FilterStats,
  },
  $I.annotations("FilterResult", {
    description: "Confidence filtering result (filtered graph + filter stats).",
  })
) {}

const DEFAULT_ENTITY_THRESHOLD = 0.5;
const DEFAULT_RELATION_THRESHOLD = 0.5;

export const filterEntities = (
  entities: readonly AssembledEntityModel[],
  threshold: number
): readonly AssembledEntityModel[] => A.filter(entities, (entity) => entity.confidence >= threshold);

export const filterRelations = (
  relations: readonly AssembledRelationModel[],
  threshold: number
): readonly AssembledRelationModel[] => A.filter(relations, (relation) => relation.confidence >= threshold);

export const removeOrphanEntities = (
  entities: readonly AssembledEntityModel[],
  relations: readonly AssembledRelationModel[]
): readonly AssembledEntityModel[] => {
  const referencedIds = MutableHashSet.fromIterable(
    A.flatMap(relations, (relation) =>
      F.pipe(
        [relation.subjectId],
        A.appendAll(F.pipe(relation.objectId, O.fromNullable, O.match({ onNone: A.empty<string>, onSome: A.of })))
      )
    )
  );

  return A.filter(entities, (entity) => MutableHashSet.has(referencedIds, entity.id));
};

export const filterGraph = (graph: KnowledgeGraphModel, config: FilterConfig = {}): FilterResult => {
  const entityThreshold = config.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD;
  const relationThreshold = config.relationThreshold ?? DEFAULT_RELATION_THRESHOLD;
  const shouldRemoveOrphans = config.removeOrphanEntities ?? true;

  let filteredEntities = filterEntities(graph.entities, entityThreshold);

  const validEntityIds = MutableHashSet.fromIterable(A.map(filteredEntities, (e) => e.id));

  const filteredRelations = A.filter(graph.relations, (relation) => {
    if (relation.confidence < relationThreshold) {
      return false;
    }
    if (!MutableHashSet.has(validEntityIds, relation.subjectId)) {
      return false;
    }
    return !(relation.objectId && !MutableHashSet.has(validEntityIds, relation.objectId));
  });

  let orphanEntitiesRemoved = 0;
  if (shouldRemoveOrphans) {
    const entitiesBeforeOrphanRemoval = A.length(filteredEntities);
    filteredEntities = removeOrphanEntities(filteredEntities, filteredRelations);
    orphanEntitiesRemoved = entitiesBeforeOrphanRemoval - A.length(filteredEntities);
  }

  const entityIndex = R.fromEntries(
    A.map(filteredEntities, (entity) => [Str.toLowerCase(entity.canonicalName ?? entity.mention), entity.id] as const)
  );

  const filteredGraph: KnowledgeGraphModel = {
    entities: filteredEntities,
    relations: filteredRelations,
    entityIndex,
    stats: {
      entityCount: A.length(filteredEntities),
      relationCount: A.length(filteredRelations),
      unresolvedSubjects: 0,
      unresolvedObjects: 0,
    },
  };

  const stats: FilterStats = {
    originalEntityCount: A.length(graph.entities),
    filteredEntityCount: A.length(filteredEntities),
    removedEntityCount: A.length(graph.entities) - A.length(filteredEntities),
    originalRelationCount: A.length(graph.relations),
    filteredRelationCount: A.length(filteredRelations),
    removedRelationCount: A.length(graph.relations) - A.length(filteredRelations),
    orphanEntitiesRemoved,
  };

  return { graph: filteredGraph, stats };
};

export const filterGraphEffect = Effect.fnUntraced(
  function* (graph: KnowledgeGraphModel, config: FilterConfig = {}) {
    yield* Effect.logDebug("ConfidenceFilter.filterGraph: starting").pipe(
      Effect.annotateLogs({
        entityCount: A.length(graph.entities),
        relationCount: A.length(graph.relations),
        entityThreshold: config.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD,
        relationThreshold: config.relationThreshold ?? DEFAULT_RELATION_THRESHOLD,
      })
    );

    return filterGraph(graph, config);
  },
  Effect.tap((result) =>
    Effect.logInfo("ConfidenceFilter.filterGraph: complete").pipe(
      Effect.annotateLogs({
        stats: result.stats,
      })
    )
  )
);

export const getLowConfidenceEntities = (
  entities: readonly AssembledEntityModel[],
  threshold: number
): readonly AssembledEntityModel[] => A.filter(entities, (entity) => entity.confidence < threshold);

export const getLowConfidenceRelations = (
  relations: readonly AssembledRelationModel[],
  threshold: number
): readonly AssembledRelationModel[] => A.filter(relations, (relation) => relation.confidence < threshold);

export const computeConfidenceStats = (
  values: readonly number[]
): {
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly median: number;
} => {
  if (A.isEmptyReadonlyArray(values)) {
    return { min: 0, max: 0, mean: 0, median: 0 };
  }

  const sorted = A.sort(values, Order.number);
  const len = A.length(sorted);
  const min = O.getOrElse(A.head(sorted), thunkZero);
  const max = O.getOrElse(A.last(sorted), thunkZero);
  const mean = A.reduce(values, 0, (acc, v) => acc + v) / len;
  const midIndex = Math.floor(len / 2);
  const median =
    len % 2 === 0
      ? F.pipe(
          O.all([A.get(sorted, midIndex - 1), A.get(sorted, midIndex)]),
          O.map(([a, b]) => (a + b) / 2),
          O.getOrElse(thunkZero)
        )
      : O.getOrElse(A.get(sorted, midIndex), thunkZero);

  return { min, max, mean, median };
};
