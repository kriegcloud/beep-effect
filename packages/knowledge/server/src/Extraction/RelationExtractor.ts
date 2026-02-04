/**
 * RelationExtractor - Triple extraction service
 *
 * Stage 4 of the extraction pipeline: Extract relations between entities.
 *
 * @module knowledge-server/Extraction/RelationExtractor
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel, Prompt } from "@effect/ai";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { buildRelationPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { TextChunk } from "../Nlp/TextChunk";
import type { OntologyContext } from "../Ontology";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import { ExtractedTriple, RelationOutput } from "./schemas/relation-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/RelationExtractor");

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
  readonly minConfidence?: undefined | number;

  /**
   * Whether to validate predicate IRIs against ontology
   */
  readonly validatePredicates?: undefined | boolean;
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
export class RelationExtractor extends Effect.Service<RelationExtractor>()($I`RelationExtractor`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;

    /**
     * Validate predicate IRIs against ontology
     */
    const validatePredicates = (
      triples: readonly ExtractedTriple[],
      ontologyContext: OntologyContext
    ): { valid: ExtractedTriple[]; invalid: ExtractedTriple[] } => {
      const valid = A.empty<ExtractedTriple>();
      const invalid = A.empty<ExtractedTriple>();

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
      extract: Effect.fnUntraced(function* (
        entities: readonly ClassifiedEntity[],
        chunk: TextChunk,
        ontologyContext: OntologyContext,
        config: RelationExtractionConfig = {}
      ) {
        const minConfidence = config.minConfidence ?? 0.5;
        const shouldValidate = config.validatePredicates ?? true;

        if (entities.length < 1) {
          yield* Effect.logDebug("Skipping relation extraction - insufficient entities", {
            entityCount: entities.length,
          });

          return {
            triples: A.empty<ExtractedTriple>(),
            invalidTriples: A.empty<ExtractedTriple>(),
            tokensUsed: 0,
          };
        }

        yield* Effect.logDebug("Extracting relations", {
          entityCount: entities.length,
          chunkIndex: chunk.index,
          propertyCount: ontologyContext.properties.length,
        });

        const prompt = Prompt.make([
          { role: "system" as const, content: buildSystemPrompt() },
          { role: "user" as const, content: buildRelationPrompt([...entities], chunk.text, ontologyContext) },
        ]);

        const result = yield* model.generateObject({
          prompt,
          schema: RelationOutput,
          objectName: "RelationOutput",
        });

        const tokensUsed = (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);

        // Filter by confidence and adjust offsets
        const confidenceFiltered = A.filter(result.value.triples, (t) => t.confidence >= minConfidence);

        const offsetAdjusted = A.map(confidenceFiltered, (t) => adjustOffsets(t, chunk.startOffset));

        // Validate predicates if enabled
        let valid = A.empty<ExtractedTriple>();
        let invalid = A.empty<ExtractedTriple>();

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
          tokensUsed,
        });

        return {
          triples: valid,
          invalidTriples: invalid,
          tokensUsed,
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
      extractFromChunks: Effect.fnUntraced(function* (
        entitiesByChunk: MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]>,
        chunks: readonly TextChunk[],
        ontologyContext: OntologyContext,
        config: RelationExtractionConfig = {}
      ) {
        const allTriples = A.empty<ExtractedTriple>();
        const allInvalid = A.empty<ExtractedTriple>();
        let totalTokens = 0;

        const minConfidence = config.minConfidence ?? 0.5;
        const shouldValidate = config.validatePredicates ?? true;

        for (const chunk of chunks) {
          const entitiesOpt = MutableHashMap.get(entitiesByChunk, chunk.index);
          const entities = O.getOrElse(entitiesOpt, () => A.empty<ClassifiedEntity>());

          if (A.isEmptyReadonlyArray(entities)) {
            continue;
          }

          const prompt = Prompt.make([
            { role: "system" as const, content: buildSystemPrompt() },
            { role: "user" as const, content: buildRelationPrompt([...entities], chunk.text, ontologyContext) },
          ]);

          const aiResult = yield* model.generateObject({
            prompt,
            schema: RelationOutput,
            objectName: "RelationOutput",
          });

          const confidenceFiltered = A.filter(aiResult.value.triples, (t) => t.confidence >= minConfidence);

          const offsetAdjusted = A.map(confidenceFiltered, (t) => adjustOffsets(t, chunk.startOffset));

          if (shouldValidate) {
            const validation = validatePredicates(offsetAdjusted, ontologyContext);
            allTriples.push(...validation.valid);
            allInvalid.push(...validation.invalid);
          } else {
            allTriples.push(...offsetAdjusted);
          }

          totalTokens += (aiResult.usage.inputTokens ?? 0) + (aiResult.usage.outputTokens ?? 0);
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
      deduplicateRelations: (triples: readonly ExtractedTriple[]): Effect.Effect<readonly ExtractedTriple[], never> => {
        return Effect.sync(() => {
          const seen = MutableHashMap.empty<string, ExtractedTriple>();

          for (const triple of triples) {
            // Create unique key for triple
            const objectPart = triple.objectMention ?? triple.literalValue ?? "";
            const key = Str.toLowerCase(`${triple.subjectMention}|${triple.predicateIri}|${objectPart}`);

            const existingOpt = MutableHashMap.get(seen, key);
            if (O.isNone(existingOpt) || triple.confidence > existingOpt.value.confidence) {
              MutableHashMap.set(seen, key, triple);
            }
          }

          const result = A.empty<ExtractedTriple>();
          MutableHashMap.forEach(seen, (triple) => {
            result.push(triple);
          });
          return result;
        });
      },
    };
  }),
}) {}
