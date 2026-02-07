import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedTriple } from "./schemas/relation-output.schema";

const $I = $KnowledgeServerId.create("Extraction/GraphAssembler");

export class AssembledEntityAttributeValue extends S.Union(S.String, S.Number, S.Boolean).annotations(
  $I.annotations("AssembledEntityAttributeValue", {
    description: "Value of an assembled entity attribute",
  })
) {}

export declare namespace AssembledEntityAttributeValue {
  export type Type = typeof AssembledEntityAttributeValue;
}

export class AssembledEntityAttributes extends S.Record({
  key: S.String,
  value: AssembledEntityAttributeValue,
}).annotations(
  $I.annotations("AssembledEntityAttributes", {
    description: "Attributes of an assembled entity",
  })
) {}

export declare namespace AssembledEntityAttributes {
  export type Type = typeof AssembledEntityAttributes;
}

export class AssembledEntity extends S.Class<AssembledEntity>($I`AssembledEntity`)(
  {
    id: S.String,
    mention: S.String,
    primaryType: S.String,
    types: S.Array(S.String),
    attributes: AssembledEntityAttributes,
    confidence: S.Number,
    canonicalName: S.optional(S.String),
  },
  $I.annotations("AssembledEntity", {
    description: "Assembled entity",
  })
) {}

export class AssembledRelation extends S.Class<AssembledRelation>($I`AssembledRelation`)(
  {
    id: S.String,
    subjectId: S.String,
    predicate: S.String,
    objectId: S.optional(S.String),
    literalValue: S.optional(S.String),
    literalType: S.optional(S.String),
    confidence: S.Number,
    evidence: S.optional(S.String),
    evidenceStartChar: S.optional(S.Number),
    evidenceEndChar: S.optional(S.Number),
  },
  $I.annotations("AssembledRelation", {
    description: "Assembled relation",
  })
) {}

export class KnowledgeGraphStats extends S.Class<KnowledgeGraphStats>($I`KnowledgeGraphStats`)(
  {
    entityCount: S.Number,
    relationCount: S.Number,
    unresolvedSubjects: S.Number,
    unresolvedObjects: S.Number,
  },
  $I.annotations("KnowledgeGraphStats", {
    description: "Statistics for a knowledge graph",
  })
) {}

export class KnowledgeGraph extends S.Class<KnowledgeGraph>($I`KnowledgeGraph`)(
  {
    entities: S.Array(AssembledEntity),
    relations: S.Array(AssembledRelation),
    entityIndex: S.Record({ key: S.String, value: S.String }),
    stats: KnowledgeGraphStats,
  },
  $I.annotations("KnowledgeGraph", {
    description: "Knowledge graph containing entities and relations",
  })
) {}
export class GraphAssemblyConfig extends S.Class<GraphAssemblyConfig>($I`GraphAssemblyConfig`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    mergeEntities: S.optional(S.Boolean),
  },
  $I.annotations("GraphAssemblyConfig", {
    description: "Configuration for graph assembly",
  })
) {}

export interface GraphAssemblerShape {
  readonly assemble: (
    entities: readonly ClassifiedEntity[],
    relations: readonly ExtractedTriple[],
    config: GraphAssemblyConfig
  ) => Effect.Effect<KnowledgeGraph, never>;
  readonly merge: (
    graphs: readonly KnowledgeGraph[],
    config: GraphAssemblyConfig
  ) => Effect.Effect<KnowledgeGraph, never>;
}

export class GraphAssembler extends Context.Tag($I`GraphAssembler`)<GraphAssembler, GraphAssemblerShape>() {}

const serviceEffect: Effect.Effect<GraphAssemblerShape> = Effect.succeed({
  assemble: Effect.fnUntraced(function* (
    entities: readonly ClassifiedEntity[],
    relations: readonly ExtractedTriple[],
    config: GraphAssemblyConfig
  ) {
    yield* Effect.logDebug("Assembling knowledge graph", {
      entityCount: A.length(entities),
      relationCount: A.length(relations),
    });

    const entityIndex = MutableHashMap.empty<string, string>();
    const assembledEntities = A.reduce(entities, A.empty<AssembledEntity>(), (acc, entity) => {
      const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

      if (config.mergeEntities && MutableHashMap.has(entityIndex, key)) {
        return acc;
      }

      const id = KnowledgeEntityIds.KnowledgeEntityId.create();
      MutableHashMap.set(entityIndex, key, id);

      const mentionKey = Str.toLowerCase(entity.mention);
      if (!MutableHashMap.has(entityIndex, mentionKey)) {
        MutableHashMap.set(entityIndex, mentionKey, id);
      }

      const types = entity.additionalTypes ? [entity.typeIri, ...entity.additionalTypes] : [entity.typeIri];

      acc.push({
        id,
        mention: entity.mention,
        primaryType: entity.typeIri,
        types,
        attributes: entity.attributes ?? {},
        confidence: entity.confidence,
        ...(entity.canonicalName !== undefined && { canonicalName: entity.canonicalName }),
      });
      return acc;
    });

    const {
      assembled: assembledRelations,
      unresolvedSubjects,
      unresolvedObjects,
    } = A.reduce(
      relations,
      { assembled: A.empty<AssembledRelation>(), unresolvedSubjects: 0, unresolvedObjects: 0 },
      (acc, triple) => {
        const subjectKey = Str.toLowerCase(triple.subjectMention);
        const subjectIdOpt = MutableHashMap.get(entityIndex, subjectKey);

        if (O.isNone(subjectIdOpt)) {
          return { ...acc, unresolvedSubjects: acc.unresolvedSubjects + 1 };
        }
        const subjectId = subjectIdOpt.value;
        const relationId = KnowledgeEntityIds.RelationId.create();

        if (triple.objectMention) {
          const objectKey = Str.toLowerCase(triple.objectMention);
          const objectIdOpt = MutableHashMap.get(entityIndex, objectKey);

          if (O.isNone(objectIdOpt)) {
            return { ...acc, unresolvedObjects: acc.unresolvedObjects + 1 };
          }

          acc.assembled.push({
            id: relationId,
            subjectId,
            predicate: triple.predicateIri,
            objectId: objectIdOpt.value,
            confidence: triple.confidence,
            ...(triple.evidence !== undefined && { evidence: triple.evidence }),
            ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
            ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
          });
        } else if (triple.literalValue !== undefined) {
          acc.assembled.push({
            id: relationId,
            subjectId,
            predicate: triple.predicateIri,
            literalValue: triple.literalValue,
            confidence: triple.confidence,
            ...(triple.literalType !== undefined && { literalType: triple.literalType }),
            ...(triple.evidence !== undefined && { evidence: triple.evidence }),
            ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
            ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
          });
        }

        return acc;
      }
    );

    const entityIndexRecord = mutableHashMapToRecord(entityIndex);

    const graph: KnowledgeGraph = {
      entities: assembledEntities,
      relations: assembledRelations,
      entityIndex: entityIndexRecord,
      stats: {
        entityCount: A.length(assembledEntities),
        relationCount: A.length(assembledRelations),
        unresolvedSubjects,
        unresolvedObjects,
      },
    };

    yield* Effect.logInfo("Knowledge graph assembled", graph.stats);

    return graph;
  }),

  merge: (graphs: readonly KnowledgeGraph[], _config: GraphAssemblyConfig): Effect.Effect<KnowledgeGraph, never> =>
    Effect.sync(() => {
      if (A.isEmptyReadonlyArray(graphs)) {
        return {
          entities: A.empty<AssembledEntity>(),
          relations: A.empty<AssembledRelation>(),
          entityIndex: {},
          stats: { entityCount: 0, relationCount: 0, unresolvedSubjects: 0, unresolvedObjects: 0 },
        };
      }

      if (A.isNonEmptyReadonlyArray(graphs) && A.length(graphs) === 1) {
        return graphs[0];
      }

      const entityIndex = MutableHashMap.empty<string, AssembledEntity>();
      const idMapping = MutableHashMap.empty<string, string>();

      for (const graph of graphs) {
        for (const entity of graph.entities) {
          const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

          if (!MutableHashMap.has(entityIndex, key)) {
            MutableHashMap.set(entityIndex, key, entity);
            MutableHashMap.set(idMapping, entity.id, entity.id);
          } else {
            const existing = O.getOrThrow(MutableHashMap.get(entityIndex, key));
            MutableHashMap.set(idMapping, entity.id, existing.id);
          }
        }
      }

      const relationSet = MutableHashSet.empty<string>();

      const relations = F.pipe(
        A.flatMap([...graphs], (graph) => [...graph.relations]),
        A.filterMap((relation) => {
          const mappedSubjectId = F.pipe(
            MutableHashMap.get(idMapping, relation.subjectId),
            O.getOrElse(() => relation.subjectId)
          );
          const mappedObjectId = F.pipe(
            O.fromNullable(relation.objectId),
            O.map((oid) =>
              F.pipe(
                MutableHashMap.get(idMapping, oid),
                O.getOrElse(() => oid)
              )
            ),
            O.getOrUndefined
          );

          const key = [mappedSubjectId, relation.predicate, mappedObjectId ?? relation.literalValue ?? ""].join("|");

          if (MutableHashSet.has(relationSet, key)) {
            return O.none();
          }

          MutableHashSet.add(relationSet, key);
          return O.some({
            ...relation,
            subjectId: mappedSubjectId,
            ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
          } as AssembledRelation);
        })
      );

      const entities = A.empty<AssembledEntity>();
      MutableHashMap.forEach(entityIndex, (entity) => {
        entities.push(entity);
      });

      const entityIndexRecord: Record<string, string> = {};
      MutableHashMap.forEach(entityIndex, (entity, key) => {
        entityIndexRecord[key] = entity.id;
      });

      return {
        entities,
        relations,
        entityIndex: entityIndexRecord,
        stats: {
          entityCount: A.length(entities),
          relationCount: A.length(relations),
          unresolvedSubjects: 0,
          unresolvedObjects: 0,
        },
      };
    }),
});

export const GraphAssemblerLive = Layer.effect(GraphAssembler, serviceEffect);

const mutableHashMapToRecord = (map: MutableHashMap.MutableHashMap<string, string>): Record<string, string> => {
  const result = R.empty<string, string>();
  MutableHashMap.forEach(map, (value, key) => {
    result[key] = value;
  });
  return result;
};
