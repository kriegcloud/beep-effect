/**
 * EntityExtractor - Ontology-guided entity classification
 *
 * Stage 3 of the extraction pipeline: Classify mentions using ontology types.
 *
 * @module knowledge-server/Extraction/EntityExtractor
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { type AiGenerationConfig, AiService } from "../Ai/AiService";
import { buildEntityPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { OntologyContext } from "../Ontology";
import { ClassifiedEntity, EntityOutput } from "./schemas/EntityOutput";
import type { ExtractedMention } from "./schemas/MentionOutput";

/**
 * Configuration for entity classification
 *
 * @since 0.1.0
 * @category schemas
 */
export interface EntityExtractionConfig {
  /**
   * Minimum confidence threshold for classifications
   */
  readonly minConfidence?: number;

  /**
   * Maximum mentions to process in single LLM call
   */
  readonly batchSize?: number;

  /**
   * AI generation configuration
   */
  readonly aiConfig?: AiGenerationConfig;
}

/**
 * Result of entity classification
 *
 * @since 0.1.0
 * @category schemas
 */
export interface EntityExtractionResult {
  /**
   * Classified entities
   */
  readonly entities: readonly ClassifiedEntity[];

  /**
   * Mentions that couldn't be classified
   */
  readonly unclassified: readonly ExtractedMention[];

  /**
   * Entities with invalid types (not in ontology)
   */
  readonly invalidTypes: readonly ClassifiedEntity[];

  /**
   * Total tokens used for classification
   */
  readonly tokensUsed: number;
}

/**
 * EntityExtractor Service
 *
 * Classifies entity mentions using ontology type definitions.
 *
 * @example
 * ```ts
 * import { EntityExtractor } from "@beep/knowledge-server/Extraction";
 * import { OntologyService } from "@beep/knowledge-server/Ontology";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const ontology = yield* OntologyService;
 *   const extractor = yield* EntityExtractor;
 *
 *   const ontologyContext = yield* ontology.load("my-ontology", turtleContent);
 *   const result = yield* extractor.classify(mentions, ontologyContext);
 *
 *   console.log(`Classified ${result.entities.length} entities`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class EntityExtractor extends Effect.Service<EntityExtractor>()("@beep/knowledge-server/EntityExtractor", {
  accessors: true,
  effect: Effect.gen(function* () {
    const ai = yield* AiService;

    /**
     * Validate entity types against ontology
     */
    const validateEntityTypes = (
      entities: readonly ClassifiedEntity[],
      ontologyContext: OntologyContext
    ): { valid: ClassifiedEntity[]; invalid: ClassifiedEntity[] } => {
      const valid: ClassifiedEntity[] = [];
      const invalid: ClassifiedEntity[] = [];

      for (const entity of entities) {
        const typeExists = O.isSome(ontologyContext.findClass(entity.typeIri));

        if (typeExists) {
          // Also validate additional types if present
          if (entity.additionalTypes) {
            const validAdditional = A.filter(entity.additionalTypes, (t) => O.isSome(ontologyContext.findClass(t)));

            valid.push(
              new ClassifiedEntity({
                ...entity,
                additionalTypes: validAdditional.length > 0 ? validAdditional : undefined,
              })
            );
          } else {
            valid.push(entity);
          }
        } else {
          invalid.push(entity);
        }
      }

      return { valid, invalid };
    };

    return {
      /**
       * Classify entity mentions using ontology types
       *
       * @param mentions - Entity mentions to classify
       * @param ontologyContext - Loaded ontology with class definitions
       * @param config - Extraction configuration
       * @returns Classification result
       */
      classify: Effect.fnUntraced(function* (
        mentions: readonly ExtractedMention[],
        ontologyContext: OntologyContext,
        config: EntityExtractionConfig = {}
      ) {
        const minConfidence = config.minConfidence ?? 0.5;
        const batchSize = config.batchSize ?? 20;

        if (mentions.length === 0) {
          return {
            entities: [],
            unclassified: [],
            invalidTypes: [],
            tokensUsed: 0,
          };
        }

        yield* Effect.logDebug("Classifying entity mentions", {
          mentionCount: mentions.length,
          classCount: ontologyContext.classes.length,
        });

        // Process in batches to avoid token limits
        const batches = A.chunksOf([...mentions], batchSize);
        const allEntities: ClassifiedEntity[] = [];
        let totalTokens = 0;

        for (const batch of batches) {
          const result = yield* ai.generateObjectWithSystem(
            EntityOutput,
            buildSystemPrompt(),
            buildEntityPrompt(batch, ontologyContext),
            config.aiConfig
          );

          // Filter by confidence
          const confidenceFiltered = A.filter(result.data.entities, (e) => e.confidence >= minConfidence);

          allEntities.push(...confidenceFiltered);
          totalTokens += result.usage.totalTokens;
        }

        // Validate types against ontology
        const { valid, invalid } = validateEntityTypes(allEntities, ontologyContext);

        // Find mentions that weren't classified
        const classifiedMentions = new Set(allEntities.map((e) => e.mention.toLowerCase()));
        const unclassified = A.filter([...mentions], (m) => !classifiedMentions.has(m.text.toLowerCase()));

        yield* Effect.logDebug("Entity classification complete", {
          validEntities: valid.length,
          invalidTypes: invalid.length,
          unclassified: unclassified.length,
          tokensUsed: totalTokens,
        });

        return {
          entities: valid,
          unclassified,
          invalidTypes: invalid,
          tokensUsed: totalTokens,
        };
      }),

      /**
       * Enrich entities with additional attributes from ontology
       *
       * @param entities - Classified entities
       * @param ontologyContext - Loaded ontology
       * @returns Entities with enriched metadata
       */
      enrichEntities: (
        entities: readonly ClassifiedEntity[],
        ontologyContext: OntologyContext
      ): Effect.Effect<readonly ClassifiedEntity[], never> =>
        Effect.sync(() => {
          return A.map([...entities], (entity) => {
            const classInfo = ontologyContext.findClass(entity.typeIri);

            if (O.isNone(classInfo)) {
              return entity;
            }

            // Entity exists in ontology - could extend with property metadata
            return entity;
          });
        }),

      /**
       * Resolve entities to canonical forms
       *
       * Groups entities that refer to the same real-world entity.
       *
       * @param entities - Classified entities
       * @returns Entity groups with canonical representatives
       */
      resolveEntities: (
        entities: readonly ClassifiedEntity[]
      ): Effect.Effect<
        ReadonlyMap<string, { canonical: ClassifiedEntity; mentions: readonly ClassifiedEntity[] }>,
        never
      > =>
        Effect.sync(() => {
          // Simple resolution by canonical name or mention text
          const groups = new Map<string, { canonical: ClassifiedEntity; mentions: ClassifiedEntity[] }>();

          for (const entity of entities) {
            const key = (entity.canonicalName ?? entity.mention).toLowerCase();

            if (groups.has(key)) {
              const group = groups.get(key)!;
              group.mentions.push(entity);

              // Update canonical if this one has higher confidence
              if (entity.confidence > group.canonical.confidence) {
                group.canonical = entity;
              }
            } else {
              groups.set(key, {
                canonical: entity,
                mentions: [entity],
              });
            }
          }

          return groups;
        }),
    };
  }),
}) {}
