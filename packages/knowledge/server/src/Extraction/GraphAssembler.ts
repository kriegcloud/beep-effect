/**
 * GraphAssembler - Knowledge graph construction
 *
 * Stage 5 of the extraction pipeline: Assemble entities and relations into a graph.
 *
 * @module knowledge-server/Extraction/GraphAssembler
 * @since 0.1.0
 */
import * as Effect from "effect/Effect";
import type { ClassifiedEntity } from "./schemas/EntityOutput";
import type { ExtractedTriple } from "./schemas/RelationOutput";

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
  readonly objectId?: string;

  /**
   * Literal value (for datatype properties)
   */
  readonly literalValue?: string;

  /**
   * Literal type (XSD datatype or language tag)
   */
  readonly literalType?: string;

  /**
   * Extraction confidence
   */
  readonly confidence: number;

  /**
   * Evidence text
   */
  readonly evidence?: string;

  /**
   * Evidence start character offset
   */
  readonly evidenceStartChar?: number;

  /**
   * Evidence end character offset
   */
  readonly evidenceEndChar?: number;
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
      ): Effect.Effect<KnowledgeGraph> =>
        Effect.gen(function* () {
          yield* Effect.logDebug("Assembling knowledge graph", {
            entityCount: entities.length,
            relationCount: relations.length,
          });

          // Generate IDs and create entity index
          const entityIndex = new Map<string, string>();
          const assembledEntities: AssembledEntity[] = [];

          for (const entity of entities) {
            const key = (entity.canonicalName ?? entity.mention).toLowerCase();

            // Check if entity already exists (for merging)
            if (config.mergeEntities && entityIndex.has(key)) {
              continue;
            }

            const id = `knowledge_entity__${crypto.randomUUID()}`;

            entityIndex.set(key, id);

            // Also index by raw mention
            const mentionKey = entity.mention.toLowerCase();
            if (!entityIndex.has(mentionKey)) {
              entityIndex.set(mentionKey, id);
            }

            const types = entity.additionalTypes
              ? [entity.typeIri, ...entity.additionalTypes]
              : [entity.typeIri];

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

            const relationId = `knowledge_relation__${crypto.randomUUID()}`;

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
          const entityIndexRecord: Record<string, string> = {};
          for (const [key, value] of entityIndex) {
            entityIndexRecord[key] = value;
          }

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
      merge: (
        graphs: readonly KnowledgeGraph[],
        _config: GraphAssemblyConfig
      ): Effect.Effect<KnowledgeGraph> =>
        Effect.sync(() => {
          if (graphs.length === 0) {
            return {
              entities: [],
              relations: [],
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
          const entityIndex = new Map<string, AssembledEntity>();
          const idMapping = new Map<string, string>();

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
                const mappedRelation: AssembledRelation = {
                  ...relation,
                  subjectId: mappedSubjectId,
                  ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
                };
                relations.push(mappedRelation);
              }
            }
          }

          const entities = Array.from(entityIndex.values());
          const entityIndexRecord: Record<string, string> = {};
          for (const [key, entity] of entityIndex) {
            entityIndexRecord[key] = entity.id;
          }

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
        }),
    }),
  }
) {}
