/**
 * GraphAssembler - Knowledge graph construction
 *
 * Stage 5 of the extraction pipeline: Assemble entities and relations into a graph.
 *
 * @module knowledge-server/Extraction/GraphAssembler
 * @since 0.1.0
 */
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { ClassifiedEntity } from "./schemas/EntityOutput";
import type { ExtractedTriple } from "./schemas/RelationOutput";
import type { ExtractedMention } from "./schemas/MentionOutput";

/**
 * Assembled entity with generated ID
 *
 * @since 0.1.0
 * @category schemas
 */
export class AssembledEntity extends S.Class<AssembledEntity>("@beep/knowledge-server/AssembledEntity")({
  /**
   * Generated entity ID
   */
  id: KnowledgeEntityIds.KnowledgeEntityId,

  /**
   * Original mention text
   */
  mention: S.String,

  /**
   * Primary ontology type IRI
   */
  primaryType: S.String,

  /**
   * All type IRIs
   */
  types: S.Array(S.String),

  /**
   * Entity attributes
   */
  attributes: S.Record({ key: S.String, value: S.Union(S.String, S.Number, S.Boolean) }),

  /**
   * Classification confidence
   */
  confidence: S.Number,

  /**
   * Canonical name for entity resolution
   */
  canonicalName: S.optional(S.String),
}) {}

export declare namespace AssembledEntity {
  export type Type = typeof AssembledEntity.Type;
  export type Encoded = typeof AssembledEntity.Encoded;
}

/**
 * Assembled relation with entity ID references
 *
 * @since 0.1.0
 * @category schemas
 */
export class AssembledRelation extends S.Class<AssembledRelation>("@beep/knowledge-server/AssembledRelation")({
  /**
   * Generated relation ID
   */
  id: KnowledgeEntityIds.RelationId,

  /**
   * Subject entity ID
   */
  subjectId: KnowledgeEntityIds.KnowledgeEntityId,

  /**
   * Predicate IRI
   */
  predicate: S.String,

  /**
   * Object entity ID (for object properties)
   */
  objectId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),

  /**
   * Literal value (for datatype properties)
   */
  literalValue: S.optional(S.String),

  /**
   * Literal type (XSD datatype or language tag)
   */
  literalType: S.optional(S.String),

  /**
   * Extraction confidence
   */
  confidence: S.Number,

  /**
   * Evidence text
   */
  evidence: S.optional(S.String),

  /**
   * Evidence start character offset
   */
  evidenceStartChar: S.optional(S.Number),

  /**
   * Evidence end character offset
   */
  evidenceEndChar: S.optional(S.Number),
}) {}

export declare namespace AssembledRelation {
  export type Type = typeof AssembledRelation.Type;
  export type Encoded = typeof AssembledRelation.Encoded;
}

/**
 * Complete assembled knowledge graph
 *
 * @since 0.1.0
 * @category schemas
 */
export class KnowledgeGraph extends S.Class<KnowledgeGraph>("@beep/knowledge-server/KnowledgeGraph")({
  /**
   * Assembled entities
   */
  entities: S.Array(AssembledEntity),

  /**
   * Assembled relations
   */
  relations: S.Array(AssembledRelation),

  /**
   * Entity lookup by mention text (lowercase)
   */
  entityIndex: S.Record({ key: S.String, value: KnowledgeEntityIds.KnowledgeEntityId }),

  /**
   * Statistics
   */
  stats: S.Struct({
    entityCount: S.Number,
    relationCount: S.Number,
    unresolvedSubjects: S.Number,
    unresolvedObjects: S.Number,
  }),
}) {}

export declare namespace KnowledgeGraph {
  export type Type = typeof KnowledgeGraph.Type;
  export type Encoded = typeof KnowledgeGraph.Encoded;
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
  readonly organizationId: SharedEntityIds.OrganizationId.Type;

  /**
   * Ontology ID for scoping
   */
  readonly ontologyId: string;

  /**
   * Whether to merge entities with same canonical name
   */
  readonly mergeEntities?: boolean;
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
 *     organizationId,
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
export class GraphAssembler extends Effect.Service<GraphAssembler>()(
  "@beep/knowledge-server/GraphAssembler",
  {
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
      assemble: (
        entities: readonly ClassifiedEntity[],
        relations: readonly ExtractedTriple[],
        config: GraphAssemblyConfig
      ): Effect.Effect<KnowledgeGraph, never> =>
        Effect.gen(function* () {
          yield* Effect.logDebug("Assembling knowledge graph", {
            entityCount: entities.length,
            relationCount: relations.length,
          });

          // Generate IDs and create entity index
          const entityIndex = new Map<string, KnowledgeEntityIds.KnowledgeEntityId.Type>();
          const assembledEntities: AssembledEntity[] = [];

          for (const entity of entities) {
            const key = (entity.canonicalName ?? entity.mention).toLowerCase();

            // Check if entity already exists (for merging)
            if (config.mergeEntities && entityIndex.has(key)) {
              continue;
            }

            const id = KnowledgeEntityIds.KnowledgeEntityId.make(
              `knowledge_entity__${crypto.randomUUID()}`
            );

            entityIndex.set(key, id);

            // Also index by raw mention
            const mentionKey = entity.mention.toLowerCase();
            if (!entityIndex.has(mentionKey)) {
              entityIndex.set(mentionKey, id);
            }

            const types = entity.additionalTypes
              ? [entity.typeIri, ...entity.additionalTypes]
              : [entity.typeIri];

            assembledEntities.push(
              new AssembledEntity({
                id,
                mention: entity.mention,
                primaryType: entity.typeIri,
                types,
                attributes: entity.attributes ?? {},
                confidence: entity.confidence,
                canonicalName: entity.canonicalName,
              })
            );
          }

          // Assemble relations with entity ID lookups
          const assembledRelations: AssembledRelation[] = [];
          let unresolvedSubjects = 0;
          let unresolvedObjects = 0;

          for (const triple of relations) {
            const subjectKey = triple.subjectMention.toLowerCase();
            const subjectId = entityIndex.get(subjectKey);

            if (!subjectId) {
              unresolvedSubjects++;
              yield* Effect.logDebug("Unresolved subject in relation", {
                subject: triple.subjectMention,
                predicate: triple.predicateIri,
              });
              continue;
            }

            const relationId = KnowledgeEntityIds.RelationId.make(
              `knowledge_relation__${crypto.randomUUID()}`
            );

            if (triple.objectMention) {
              // Object property
              const objectKey = triple.objectMention.toLowerCase();
              const objectId = entityIndex.get(objectKey);

              if (!objectId) {
                unresolvedObjects++;
                yield* Effect.logDebug("Unresolved object in relation", {
                  subject: triple.subjectMention,
                  predicate: triple.predicateIri,
                  object: triple.objectMention,
                });
                continue;
              }

              assembledRelations.push(
                new AssembledRelation({
                  id: relationId,
                  subjectId,
                  predicate: triple.predicateIri,
                  objectId,
                  confidence: triple.confidence,
                  evidence: triple.evidence,
                  evidenceStartChar: triple.evidenceStartChar,
                  evidenceEndChar: triple.evidenceEndChar,
                })
              );
            } else if (triple.literalValue !== undefined) {
              // Datatype property
              assembledRelations.push(
                new AssembledRelation({
                  id: relationId,
                  subjectId,
                  predicate: triple.predicateIri,
                  literalValue: triple.literalValue,
                  literalType: triple.literalType,
                  confidence: triple.confidence,
                  evidence: triple.evidence,
                  evidenceStartChar: triple.evidenceStartChar,
                  evidenceEndChar: triple.evidenceEndChar,
                })
              );
            }
          }

          // Convert entity index to record
          const entityIndexRecord: Record<string, KnowledgeEntityIds.KnowledgeEntityId.Type> = {};
          for (const [key, value] of entityIndex) {
            entityIndexRecord[key] = value;
          }

          const graph = new KnowledgeGraph({
            entities: assembledEntities,
            relations: assembledRelations,
            entityIndex: entityIndexRecord,
            stats: {
              entityCount: assembledEntities.length,
              relationCount: assembledRelations.length,
              unresolvedSubjects,
              unresolvedObjects,
            },
          });

          yield* Effect.logInfo("Knowledge graph assembled", graph.stats);

          return graph;
        }),

      /**
       * Merge multiple knowledge graphs
       *
       * @param graphs - Graphs to merge
       * @param config - Assembly configuration
       * @returns Merged graph
       */
      merge: (
        graphs: readonly KnowledgeGraph[],
        config: GraphAssemblyConfig
      ): Effect.Effect<KnowledgeGraph, never> =>
        Effect.gen(function* () {
          if (graphs.length === 0) {
            return new KnowledgeGraph({
              entities: [],
              relations: [],
              entityIndex: {},
              stats: {
                entityCount: 0,
                relationCount: 0,
                unresolvedSubjects: 0,
                unresolvedObjects: 0,
              },
            });
          }

          if (graphs.length === 1) {
            return graphs[0];
          }

          // Collect all entities, deduplicating by canonical name
          const entityIndex = new Map<string, AssembledEntity>();
          const idMapping = new Map<string, KnowledgeEntityIds.KnowledgeEntityId.Type>();

          for (const graph of graphs) {
            for (const entity of graph.entities) {
              const key = (entity.canonicalName ?? entity.mention).toLowerCase();

              if (!entityIndex.has(key)) {
                entityIndex.set(key, entity);
                idMapping.set(entity.id, entity.id);
              } else {
                // Map old ID to existing entity's ID
                const existing = entityIndex.get(key)!;
                idMapping.set(entity.id, existing.id);
              }
            }
          }

          // Collect relations, updating IDs
          const relationSet = new Set<string>();
          const relations: AssembledRelation[] = [];

          for (const graph of graphs) {
            for (const relation of graph.relations) {
              const mappedSubjectId = idMapping.get(relation.subjectId) ?? relation.subjectId;
              const mappedObjectId = relation.objectId
                ? idMapping.get(relation.objectId) ?? relation.objectId
                : undefined;

              // Create dedup key
              const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

              if (!relationSet.has(key)) {
                relationSet.add(key);
                relations.push(
                  new AssembledRelation({
                    ...relation,
                    subjectId: mappedSubjectId,
                    objectId: mappedObjectId,
                  })
                );
              }
            }
          }

          const entities = Array.from(entityIndex.values());
          const entityIndexRecord: Record<string, KnowledgeEntityIds.KnowledgeEntityId.Type> = {};
          for (const [key, entity] of entityIndex) {
            entityIndexRecord[key] = entity.id;
          }

          return new KnowledgeGraph({
            entities,
            relations,
            entityIndex: entityIndexRecord,
            stats: {
              entityCount: entities.length,
              relationCount: relations.length,
              unresolvedSubjects: 0,
              unresolvedObjects: 0,
            },
          });
        }),
    }),
  }
) {}
