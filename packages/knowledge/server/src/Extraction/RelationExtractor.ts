/**
 * RelationExtractor - Triple extraction service
 *
 * Stage 4 of the extraction pipeline: Extract relations between entities.
 *
 * @module knowledge-server/Extraction/RelationExtractor
 * @since 0.1.0
 */
import { Errors } from "@beep/knowledge-domain";
const { LlmExtractionError } = Errors;
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { AiService, type AiGenerationConfig } from "../Ai/AiService";
import { buildRelationPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { OntologyContext } from "../Ontology";
import type { TextChunk } from "../Nlp/TextChunk";
import type { ClassifiedEntity } from "./schemas/EntityOutput";
import { ExtractedTriple, RelationOutput } from "./schemas/RelationOutput";

/**
 * Configuration for relation extraction
 *
 * @since 0.1.0
 * @category schemas
 */
export interface RelationExtractionConfig {
  /**
   * Minimum confidence threshold for relations
   */
  readonly minConfidence?: number;

  /**
   * Whether to validate predicate IRIs against ontology
   */
  readonly validatePredicates?: boolean;

  /**
   * AI generation configuration
   */
  readonly aiConfig?: AiGenerationConfig;
}

/**
 * Result of relation extraction
 *
 * @since 0.1.0
 * @category schemas
 */
export interface RelationExtractionResult {
  /**
   * Extracted triples with valid predicates
   */
  readonly triples: readonly ExtractedTriple[];

  /**
   * Triples with invalid predicates (not in ontology)
   */
  readonly invalidTriples: readonly ExtractedTriple[];

  /**
   * Total tokens used
   */
  readonly tokensUsed: number;
}

/**
 * RelationExtractor Service
 *
 * Extracts subject-predicate-object triples from text using ontology properties.
 *
 * @example
 * ```ts
 * import { RelationExtractor } from "@beep/knowledge-server/Extraction";
 * import { OntologyService } from "@beep/knowledge-server/Ontology";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const ontology = yield* OntologyService;
 *   const extractor = yield* RelationExtractor;
 *
 *   const ontologyContext = yield* ontology.load("my-ontology", turtleContent);
 *   const result = yield* extractor.extract(entities, textChunk, ontologyContext);
 *
 *   console.log(`Extracted ${result.triples.length} relations`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class RelationExtractor extends Effect.Service<RelationExtractor>()(
  "@beep/knowledge-server/RelationExtractor",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;

      /**
       * Validate predicate IRIs against ontology
       */
      const validatePredicates = (
        triples: readonly ExtractedTriple[],
        ontologyContext: OntologyContext
      ): { valid: ExtractedTriple[]; invalid: ExtractedTriple[] } => {
        const valid: ExtractedTriple[] = [];
        const invalid: ExtractedTriple[] = [];

        for (const triple of triples) {
          const propertyExists = O.isSome(ontologyContext.findProperty(triple.predicateIri));

          if (propertyExists) {
            valid.push(triple);
          } else {
            invalid.push(triple);
          }
        }

        return { valid, invalid };
      };

      /**
       * Adjust evidence offsets to document level
       */
      const adjustOffsets = (triple: ExtractedTriple, chunkOffset: number): ExtractedTriple => {
        if (triple.evidenceStartChar === undefined || triple.evidenceEndChar === undefined) {
          return triple;
        }

        return new ExtractedTriple({
          ...triple,
          evidenceStartChar: triple.evidenceStartChar + chunkOffset,
          evidenceEndChar: triple.evidenceEndChar + chunkOffset,
        });
      };

      return {
        /**
         * Extract relations from a text chunk given classified entities
         *
         * @param entities - Classified entities in this chunk
         * @param chunk - Text chunk to process
         * @param ontologyContext - Loaded ontology with property definitions
         * @param config - Extraction configuration
         * @returns Extraction result
         */
        extract: (
          entities: readonly ClassifiedEntity[],
          chunk: TextChunk,
          ontologyContext: OntologyContext,
          config: RelationExtractionConfig = {}
        ): Effect.Effect<RelationExtractionResult, LlmExtractionError> =>
          Effect.gen(function* () {
            const minConfidence = config.minConfidence ?? 0.5;
            const shouldValidate = config.validatePredicates ?? true;

            if (entities.length < 2) {
              // Need at least 2 entities to have relations between them
              // (though single entity can have datatype properties)
              yield* Effect.logDebug("Skipping relation extraction - insufficient entities", {
                entityCount: entities.length,
              });

              return {
                triples: [],
                invalidTriples: [],
                tokensUsed: 0,
              };
            }

            yield* Effect.logDebug("Extracting relations", {
              entityCount: entities.length,
              chunkIndex: chunk.index,
              propertyCount: ontologyContext.properties.length,
            });

            const result = yield* ai.generateObjectWithSystem(
              RelationOutput,
              buildSystemPrompt(),
              buildRelationPrompt(entities, chunk.text, ontologyContext),
              config.aiConfig
            );

            // Filter by confidence and adjust offsets
            const confidenceFiltered = A.filter(
              result.data.triples,
              (t) => t.confidence >= minConfidence
            );

            const offsetAdjusted = A.map(confidenceFiltered, (t) =>
              adjustOffsets(t, chunk.startOffset)
            );

            // Validate predicates if enabled
            let valid: ExtractedTriple[];
            let invalid: ExtractedTriple[];

            if (shouldValidate) {
              const validation = validatePredicates(offsetAdjusted, ontologyContext);
              valid = validation.valid;
              invalid = validation.invalid;
            } else {
              valid = [...offsetAdjusted];
              invalid = [];
            }

            yield* Effect.logDebug("Relation extraction complete", {
              validTriples: valid.length,
              invalidTriples: invalid.length,
              tokensUsed: result.usage.totalTokens,
            });

            return {
              triples: valid,
              invalidTriples: invalid,
              tokensUsed: result.usage.totalTokens,
            };
          }),

        /**
         * Extract relations from multiple chunks
         *
         * @param entitiesByChunk - Map of chunk index to entities
         * @param chunks - Text chunks
         * @param ontologyContext - Loaded ontology
         * @param config - Extraction configuration
         * @returns Combined extraction results
         */
        extractFromChunks: (
          entitiesByChunk: ReadonlyMap<number, readonly ClassifiedEntity[]>,
          chunks: readonly TextChunk[],
          ontologyContext: OntologyContext,
          config: RelationExtractionConfig = {}
        ): Effect.Effect<RelationExtractionResult, LlmExtractionError> =>
          Effect.gen(function* () {
            const allTriples: ExtractedTriple[] = [];
            const allInvalid: ExtractedTriple[] = [];
            let totalTokens = 0;

            for (const chunk of chunks) {
              const entities = entitiesByChunk.get(chunk.index) ?? [];

              if (entities.length < 1) {
                continue;
              }

              const result = yield* Effect.gen(function* () {
                const minConfidence = config.minConfidence ?? 0.5;
                const shouldValidate = config.validatePredicates ?? true;

                const aiResult = yield* ai.generateObjectWithSystem(
                  RelationOutput,
                  buildSystemPrompt(),
                  buildRelationPrompt(entities, chunk.text, ontologyContext),
                  config.aiConfig
                );

                const confidenceFiltered = A.filter(
                  aiResult.data.triples,
                  (t) => t.confidence >= minConfidence
                );

                const offsetAdjusted = A.map(confidenceFiltered, (t) =>
                  adjustOffsets(t, chunk.startOffset)
                );

                if (shouldValidate) {
                  const validation = validatePredicates(offsetAdjusted, ontologyContext);
                  return {
                    valid: validation.valid,
                    invalid: validation.invalid,
                    tokens: aiResult.usage.totalTokens,
                  };
                }

                return {
                  valid: [...offsetAdjusted],
                  invalid: [] as ExtractedTriple[],
                  tokens: aiResult.usage.totalTokens,
                };
              });

              allTriples.push(...result.valid);
              allInvalid.push(...result.invalid);
              totalTokens += result.tokens;
            }

            yield* Effect.logInfo("Relation extraction from chunks complete", {
              chunkCount: chunks.length,
              totalTriples: allTriples.length,
              invalidTriples: allInvalid.length,
              tokensUsed: totalTokens,
            });

            return {
              triples: allTriples,
              invalidTriples: allInvalid,
              tokensUsed: totalTokens,
            };
          }),

        /**
         * Deduplicate relations
         *
         * Removes duplicate triples, keeping highest confidence.
         *
         * @param triples - Extracted triples
         * @returns Deduplicated triples
         */
        deduplicateRelations: (
          triples: readonly ExtractedTriple[]
        ): Effect.Effect<readonly ExtractedTriple[], never> =>
          Effect.sync(() => {
            const seen = new Map<string, ExtractedTriple>();

            for (const triple of triples) {
              // Create unique key for triple
              const objectPart = triple.objectMention ?? triple.literalValue ?? "";
              const key = `${triple.subjectMention}|${triple.predicateIri}|${objectPart}`.toLowerCase();

              const existing = seen.get(key);
              if (!existing || triple.confidence > existing.confidence) {
                seen.set(key, triple);
              }
            }

            return Array.from(seen.values());
          }),
      };
    }),
  }
) {}
