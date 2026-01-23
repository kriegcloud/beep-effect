/**
 * GroundingService - Relation verification via embedding similarity
 *
 * Verifies extracted relations against source text by comparing
 * embedding similarity between relation statements and source content.
 *
 * @module knowledge-server/Grounding/GroundingService
 * @since 0.1.0
 */
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { EmbeddingError } from "../Embedding/EmbeddingProvider";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import type { AssembledEntity, AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { extractLocalName } from "../Ontology/constants";
import { cosineSimilarity } from "../utils/vector";
// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for grounding verification
 *
 * @since 0.1.0
 * @category configuration
 */
export interface GroundingConfig {
  /**
   * Minimum similarity for a relation to be considered grounded
   * @default 0.8
   */
  readonly confidenceThreshold?: undefined | number;

  /**
   * Whether to include ungrounded relations in result
   * @default false
   */
  readonly keepUngrounded?: undefined | boolean;
}

/**
 * Result of grounding verification
 *
 * @since 0.1.0
 * @category schemas
 */
export interface GroundingResult {
  /**
   * Relations that passed grounding verification
   */
  readonly groundedRelations: readonly AssembledRelation[];

  /**
   * Relations that failed grounding (if keepUngrounded=true)
   */
  readonly ungroundedRelations: readonly AssembledRelation[];

  /**
   * Statistics about the grounding process
   */
  readonly stats: {
    readonly total: number;
    readonly grounded: number;
    readonly ungrounded: number;
    readonly averageConfidence: number;
  };
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

// =============================================================================
// Utilities
// =============================================================================

/**
 * Convert relation to natural language statement
 */
const relationToStatement = (
  relation: AssembledRelation,
  subjectMention: string,
  objectMention?: undefined | string
): string => {
  const predicateLabel = extractLocalName(relation.predicate);

  // Make predicate more readable (convert camelCase to spaces)
  const readablePredicate = F.pipe(predicateLabel, Str.replace(/([A-Z])/g, " $1"), Str.toLowerCase, Str.trim);

  if (relation.literalValue !== undefined) {
    return `${subjectMention} ${readablePredicate} ${relation.literalValue}`;
  }

  if (objectMention) {
    return `${subjectMention} ${readablePredicate} ${objectMention}`;
  }

  return `${subjectMention} has property ${readablePredicate}`;
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * GroundingService - Verify relations against source text
 *
 * Uses embedding similarity to verify that extracted relations
 * are actually supported by the source text.
 *
 * @example
 * ```ts
 * import { GroundingService } from "@beep/knowledge-server/Grounding";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* GroundingService;
 *
 *   // Verify relations from extraction
 *   const result = yield* service.verifyRelations(
 *     knowledgeGraph,
 *     sourceText,
 *     organizationId,
 *     ontologyId,
 *     { confidenceThreshold: 0.8 }
 *   );
 *
 *   console.log(`Grounded: ${result.stats.grounded}/${result.stats.total}`);
 *
 *   // Apply grounding to get filtered graph
 *   const groundedGraph = service.applyGrounding(knowledgeGraph, result);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class GroundingService extends Effect.Service<GroundingService>()("@beep/knowledge-server/GroundingService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const embedding = yield* EmbeddingService;

    /**
     * Verify relations against source text
     *
     * @param graph - Knowledge graph with entities and relations
     * @param sourceText - Original source text
     * @param organizationId - Organization ID
     * @param ontologyId - Ontology ID
     * @param config - Grounding configuration
     * @returns Grounding result with verified relations
     */
    const verifyRelations = (
      graph: KnowledgeGraph,
      sourceText: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string,
      config: GroundingConfig = {}
    ): Effect.Effect<GroundingResult, EmbeddingError> =>
      Effect.gen(function* () {
        const threshold = config.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

        yield* Effect.logInfo("GroundingService.verifyRelations: starting", {
          relationCount: graph.relations.length,
          threshold,
        });

        if (A.isEmptyReadonlyArray(graph.relations)) {
          return {
            groundedRelations: A.empty<AssembledRelation>(),
            ungroundedRelations: A.empty<AssembledRelation>(),
            stats: {
              total: 0,
              grounded: 0,
              ungrounded: 0,
              averageConfidence: 0,
            },
          };
        }

        // Embed source text as document
        const sourceEmbedding = yield* embedding.embed(sourceText, "search_document", organizationId, ontologyId);

        // Build entity lookup by ID
        const entityById = MutableHashMap.empty<string, AssembledEntity>();
        for (const entity of graph.entities) {
          MutableHashMap.set(entityById, entity.id, entity);
        }

        const grounded = A.empty<AssembledRelation>();
        const ungrounded = A.empty<AssembledRelation>();
        let totalConfidence = 0;

        for (const relation of graph.relations) {
          const subjectOpt = MutableHashMap.get(entityById, relation.subjectId);

          if (O.isNone(subjectOpt)) {
            yield* Effect.logDebug("GroundingService: missing subject entity", {
              relationId: relation.id,
              subjectId: relation.subjectId,
            });
            if (config.keepUngrounded) {
              ungrounded.push(relation);
            }
            continue;
          }
          const subject = subjectOpt.value;

          const objectOpt = relation.objectId ? MutableHashMap.get(entityById, relation.objectId) : O.none();
          const object = O.isSome(objectOpt) ? objectOpt.value : undefined;

          // Convert relation to natural language statement
          const statement = relationToStatement(relation, subject.mention, object?.mention);

          // Embed statement as query
          const statementEmbedding = yield* embedding.embed(statement, "search_query", organizationId, ontologyId);

          // Compute similarity
          const similarity = cosineSimilarity(sourceEmbedding, statementEmbedding);

          // Update relation with grounded confidence
          const updatedRelation: AssembledRelation = {
            ...relation,
            confidence: similarity,
          };

          if (similarity >= threshold) {
            grounded.push(updatedRelation);
            totalConfidence += similarity;
          } else {
            if (config.keepUngrounded) {
              ungrounded.push(updatedRelation);
            }
            yield* Effect.logDebug("GroundingService: relation below threshold", {
              relationId: relation.id,
              statement,
              similarity,
              threshold,
            });
          }
        }

        const result: GroundingResult = {
          groundedRelations: grounded,
          ungroundedRelations: ungrounded,
          stats: {
            total: graph.relations.length,
            grounded: grounded.length,
            ungrounded: ungrounded.length,
            averageConfidence: A.isNonEmptyReadonlyArray(grounded) ? totalConfidence / grounded.length : 0,
          },
        };

        yield* Effect.logInfo("GroundingService.verifyRelations: complete", result.stats);

        return result;
      }).pipe(
        Effect.withSpan("GroundingService.verifyRelations", {
          captureStackTrace: false,
          attributes: { relationCount: graph.relations.length, organizationId, ontologyId },
        })
      );

    /**
     * Apply grounding results to knowledge graph
     *
     * Returns a new graph with only grounded relations.
     *
     * @param graph - Original knowledge graph
     * @param groundingResult - Grounding verification result
     * @returns Filtered knowledge graph
     */
    const applyGrounding = (graph: KnowledgeGraph, groundingResult: GroundingResult): KnowledgeGraph => ({
      ...graph,
      relations: groundingResult.groundedRelations,
      stats: {
        ...graph.stats,
        relationCount: groundingResult.groundedRelations.length,
      },
    });

    /**
     * Verify a single relation against source text
     *
     * @param relation - Relation to verify
     * @param subjectMention - Subject entity mention text
     * @param objectMention - Object entity mention text (optional)
     * @param sourceText - Source text
     * @param organizationId - Organization ID
     * @param ontologyId - Ontology ID
     * @returns Confidence score (0-1)
     */
    const verifyRelation = Effect.fnUntraced(function* (
      relation: AssembledRelation,
      subjectMention: string,
      objectMention: string | undefined,
      sourceText: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string
    ) {
      const statement = relationToStatement(relation, subjectMention, objectMention);

      const [sourceEmbed, statementEmbed] = yield* Effect.all([
        embedding.embed(sourceText, "search_document", organizationId, ontologyId),
        embedding.embed(statement, "search_query", organizationId, ontologyId),
      ]);

      return cosineSimilarity(sourceEmbed, statementEmbed);
    });

    return {
      verifyRelations,
      applyGrounding,
      verifyRelation,
    };
  }),
}) {}

/**
 * GroundingService layer with dependencies
 *
 * @since 0.1.0
 * @category layers
 */
export const GroundingServiceLive = GroundingService.Default.pipe(Layer.provide(EmbeddingService.Default));
