import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedTriple } from "./schemas/relation-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/GraphAssembler");

export interface AssembledEntity {
  readonly id: string;
  readonly mention: string;
  readonly primaryType: string;
  readonly types: readonly string[];
  readonly attributes: Record<string, string | number | boolean>;
  readonly confidence: number;
  readonly canonicalName?: undefined | string;
}

export interface AssembledRelation {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly objectId?: undefined | string;
  readonly literalValue?: undefined | string;
  readonly literalType?: undefined | string;
  readonly confidence: number;
  readonly evidence?: undefined | string;
  readonly evidenceStartChar?: undefined | number;
  readonly evidenceEndChar?: undefined | number;
}

export interface KnowledgeGraph {
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly AssembledRelation[];
  readonly entityIndex: Record<string, string>;
  readonly stats: {
    readonly entityCount: number;
    readonly relationCount: number;
    readonly unresolvedSubjects: number;
    readonly unresolvedObjects: number;
  };
}

export interface GraphAssemblyConfig {
  readonly organizationId: string;
  readonly ontologyId: string;
  readonly mergeEntities?: undefined | boolean;
}

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
  const result: Record<string, string> = {};
  MutableHashMap.forEach(map, (value, key) => {
    result[key] = value;
  });
  return result;
};
