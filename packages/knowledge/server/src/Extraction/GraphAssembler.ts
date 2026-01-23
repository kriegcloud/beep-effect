/**
 * GraphAssembler - Knowledge graph construction
 *
 * Stage 5 of the extraction pipeline: Assemble entities and relations into a graph.
 *
 * @module knowledge-server/Extraction/GraphAssembler
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedTriple } from "./schemas/relation-output.schema";
/**
 * Assembled entity with generated ID
 *
 * @since 0.1.0
 * @category schemas
 */
export interface AssembledEntity {
  /**
   * Generated entity ID
   */
  readonly id: string;

  /**
   * Original mention text
   */
  readonly mention: string;

  /**
   * Primary ontology type IRI
   */
  readonly primaryType: string;

  /**
   * All type IRIs
   */
  readonly types: readonly string[];

  /**
   * Entity attributes
   */
  readonly attributes: Record<string, string | number | boolean>;

  /**
   * Classification confidence
   */
  readonly confidence: number;

  /**
   * Canonical name for entity resolution
   */
  readonly canonicalName?: string;
}

/**
 * Assembled relation with entity ID references
 *
 * @since 0.1.0
 * @category schemas
 */
export interface AssembledRelation {
  /**
   * Generated relation ID
   */
  readonly id: string;

  /**
   * Subject entity ID
   */
  readonly subjectId: string;

  /**
   * Predicate IRI
   */
  readonly predicate: string;

  /**
   * Object entity ID (for object properties)
   */
  readonly objectId?: undefined | string;

  /**
   * Literal value (for datatype properties)
   */
  readonly literalValue?: undefined | string;

  /**
   * Literal type (XSD datatype or language tag)
   */
  readonly literalType?: undefined | string;

  /**
   * Extraction confidence
   */
  readonly confidence: number;

  /**
   * Evidence text
   */
  readonly evidence?: undefined | string;

  /**
   * Evidence start character offset
   */
  readonly evidenceStartChar?: undefined | number;

  /**
   * Evidence end character offset
   */
  readonly evidenceEndChar?: undefined | number;
}

/**
 * Complete assembled knowledge graph
 *
 * @since 0.1.0
 * @category schemas
 */
export interface KnowledgeGraph {
  /**
   * Assembled entities
   */
  readonly entities: readonly AssembledEntity[];

  /**
   * Assembled relations
   */
  readonly relations: readonly AssembledRelation[];

  /**
   * Entity lookup by mention text (lowercase)
   */
  readonly entityIndex: Record<string, string>;

  /**
   * Statistics
   */
  readonly stats: {
    readonly entityCount: number;
    readonly relationCount: number;
    readonly unresolvedSubjects: number;
    readonly unresolvedObjects: number;
  };
}

/**
 * Configuration for graph assembly
 *
 * @since 0.1.0
 * @category schemas
 */
export interface GraphAssemblyConfig {
  /**
   * Organization ID for generated entities
   */
  readonly organizationId: string;

  /**
   * Ontology ID for scoping
   */
  readonly ontologyId: string;

  /**
   * Whether to merge entities with same canonical name
   */
  readonly mergeEntities?: undefined | boolean;
}

/**
 * GraphAssembler Service
 *
 * Combines classified entities and extracted relations into a knowledge graph.
 *
 * @example
 * ```ts
 * import { GraphAssembler } from "@beep/knowledge-server/Extraction";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const assembler = yield* GraphAssembler;
 *   const graph = yield* assembler.assemble(entities, relations, {
 *     organizationId: "org-123",
 *     ontologyId: "my-ontology",
 *   });
 *
 *   console.log(`Graph: ${graph.stats.entityCount} entities, ${graph.stats.relationCount} relations`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class GraphAssembler extends Effect.Service<GraphAssembler>()("@beep/knowledge-server/GraphAssembler", {
  accessors: true,
  effect: Effect.succeed({
    /**
     * Assemble entities and relations into a knowledge graph
     *
     * @param entities - Classified entities
     * @param relations - Extracted triples
     * @param config - Assembly configuration
     * @returns Assembled knowledge graph
     */
    assemble: Effect.fnUntraced(function* (
      entities: readonly ClassifiedEntity[],
      relations: readonly ExtractedTriple[],
      config: GraphAssemblyConfig
    ) {
      yield* Effect.logDebug("Assembling knowledge graph", {
        entityCount: entities.length,
        relationCount: relations.length,
      });

      // Generate IDs and create entity index
      const entityIndex = MutableHashMap.empty<string, string>();
      const assembledEntities = A.empty<AssembledEntity>();

      for (const entity of entities) {
        const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

        // Check if entity already exists (for merging)
        if (config.mergeEntities && MutableHashMap.has(entityIndex, key)) {
          continue;
        }

        const id = KnowledgeEntityIds.KnowledgeEntityId.create();

        MutableHashMap.set(entityIndex, key, id);

        // Also index by raw mention
        const mentionKey = Str.toLowerCase(entity.mention);
        if (!MutableHashMap.has(entityIndex, mentionKey)) {
          MutableHashMap.set(entityIndex, mentionKey, id);
        }

        const types = entity.additionalTypes ? [entity.typeIri, ...entity.additionalTypes] : [entity.typeIri];

        const assembledEntity: AssembledEntity = {
          id,
          mention: entity.mention,
          primaryType: entity.typeIri,
          types,
          attributes: entity.attributes ?? {},
          confidence: entity.confidence,
          ...(entity.canonicalName !== undefined && { canonicalName: entity.canonicalName }),
        };
        assembledEntities.push(assembledEntity);
      }

      // Assemble relations with entity ID lookups
      const assembledRelations = A.empty<AssembledRelation>();
      let unresolvedSubjects = 0;
      let unresolvedObjects = 0;

      for (const triple of relations) {
        const subjectKey = Str.toLowerCase(triple.subjectMention);
        const subjectIdOpt = MutableHashMap.get(entityIndex, subjectKey);

        if (O.isNone(subjectIdOpt)) {
          unresolvedSubjects++;
          yield* Effect.logDebug("Unresolved subject in relation", {
            subject: triple.subjectMention,
            predicate: triple.predicateIri,
          });
          continue;
        }
        const subjectId = subjectIdOpt.value;

        const relationId = KnowledgeEntityIds.RelationId.create();

        if (triple.objectMention) {
          // Object property
          const objectKey = Str.toLowerCase(triple.objectMention);
          const objectIdOpt = MutableHashMap.get(entityIndex, objectKey);

          if (O.isNone(objectIdOpt)) {
            unresolvedObjects++;
            yield* Effect.logDebug("Unresolved object in relation", {
              subject: triple.subjectMention,
              predicate: triple.predicateIri,
              object: triple.objectMention,
            });
            continue;
          }
          const objectId = objectIdOpt.value;

          const relation: AssembledRelation = {
            id: relationId,
            subjectId,
            predicate: triple.predicateIri,
            objectId,
            confidence: triple.confidence,
            ...(triple.evidence !== undefined && { evidence: triple.evidence }),
            ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
            ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
          };
          assembledRelations.push(relation);
        } else if (triple.literalValue !== undefined) {
          // Datatype property
          const relation: AssembledRelation = {
            id: relationId,
            subjectId,
            predicate: triple.predicateIri,
            literalValue: triple.literalValue,
            confidence: triple.confidence,
            ...(triple.literalType !== undefined && { literalType: triple.literalType }),
            ...(triple.evidence !== undefined && { evidence: triple.evidence }),
            ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
            ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
          };
          assembledRelations.push(relation);
        }
      }

      // Convert entity index to record
      const entityIndexRecord = R.empty<string, string>();
      MutableHashMap.forEach(entityIndex, (value, key) => {
        entityIndexRecord[key] = value;
      });

      const graph: KnowledgeGraph = {
        entities: assembledEntities,
        relations: assembledRelations,
        entityIndex: entityIndexRecord,
        stats: {
          entityCount: assembledEntities.length,
          relationCount: assembledRelations.length,
          unresolvedSubjects,
          unresolvedObjects,
        },
      };

      yield* Effect.logInfo("Knowledge graph assembled", graph.stats);

      return graph;
    }),

    /**
     * Merge multiple knowledge graphs
     *
     * @param graphs - Graphs to merge
     * @param _config - Assembly configuration
     * @returns Merged graph
     */
    merge: (graphs: readonly KnowledgeGraph[], _config: GraphAssemblyConfig): Effect.Effect<KnowledgeGraph, never> => {
      return Effect.sync(() => {
        if (A.isEmptyReadonlyArray(graphs)) {
          return {
            entities: A.empty<AssembledEntity>(),
            relations: A.empty<AssembledRelation>(),
            entityIndex: {},
            stats: {
              entityCount: 0,
              relationCount: 0,
              unresolvedSubjects: 0,
              unresolvedObjects: 0,
            },
          };
        }

        if (graphs.length === 1) {
          const firstGraph = graphs[0];
          if (firstGraph !== undefined) {
            return firstGraph;
          }
        }

        // Collect all entities, deduplicating by canonical name
        const entityIndex = MutableHashMap.empty<string, AssembledEntity>();
        const idMapping = MutableHashMap.empty<string, string>();

        for (const graph of graphs) {
          for (const entity of graph.entities) {
            const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

            if (!MutableHashMap.has(entityIndex, key)) {
              MutableHashMap.set(entityIndex, key, entity);
              MutableHashMap.set(idMapping, entity.id, entity.id);
            } else {
              // Map old ID to existing entity's ID
              const existing = O.getOrThrow(MutableHashMap.get(entityIndex, key));
              MutableHashMap.set(idMapping, entity.id, existing.id);
            }
          }
        }

        // Collect relations, updating IDs
        const relationSet = MutableHashSet.empty<string>();
        const relations = A.empty<AssembledRelation>();

        for (const graph of graphs) {
          for (const relation of graph.relations) {
            const mappedSubjectId = O.getOrElse(
              MutableHashMap.get(idMapping, relation.subjectId),
              () => relation.subjectId
            );
            const mappedObjectId = relation.objectId
              ? O.getOrElse(MutableHashMap.get(idMapping, relation.objectId), () => relation.objectId)
              : undefined;

            // Create dedup key
            const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

            if (!MutableHashSet.has(relationSet, key)) {
              MutableHashSet.add(relationSet, key);
              const mappedRelation: AssembledRelation = {
                ...relation,
                subjectId: mappedSubjectId,
                ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
              };
              relations.push(mappedRelation);
            }
          }
        }

        const entities: AssembledEntity[] = [];
        MutableHashMap.forEach(entityIndex, (entity) => {
          entities.push(entity);
        });
        const entityIndexRecord = R.empty<string, string>();
        MutableHashMap.forEach(entityIndex, (entity, key) => {
          entityIndexRecord[key] = entity.id;
        });

        return {
          entities,
          relations,
          entityIndex: entityIndexRecord,
          stats: {
            entityCount: entities.length,
            relationCount: relations.length,
            unresolvedSubjects: 0,
            unresolvedObjects: 0,
          },
        };
      });
    },
  }),
}) {}
