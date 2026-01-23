/**
 * EntityExtractor - Ontology-guided entity classification
 *
 * Stage 3 of the extraction pipeline: Classify mentions using ontology types.
 *
 * @module knowledge-server/Extraction/EntityExtractor
 * @since 0.1.0
 */
import { LanguageModel, Prompt } from "@effect/ai";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { buildEntityPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { OntologyContext } from "../Ontology";
import { ClassifiedEntity, EntityOutput } from "./schemas/entity-output.schema";
import type { ExtractedMention } from "./schemas/mention-output.schema";

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
  readonly minConfidence?: undefined | number;

  /**
   * Maximum mentions to process in single LLM call
   */
  readonly batchSize?: undefined | number;
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
    const model = yield* LanguageModel.LanguageModel;

    /**
     * Validate entity types against ontology
     */
    const validateEntityTypes = (
      entities: readonly ClassifiedEntity[],
      ontologyContext: OntologyContext
    ): { valid: ClassifiedEntity[]; invalid: ClassifiedEntity[] } => {
      const valid = A.empty<ClassifiedEntity>();
      const invalid = A.empty<ClassifiedEntity>();

      for (const entity of entities) {
        const typeExists = O.isSome(ontologyContext.findClass(entity.typeIri));

        if (typeExists) {
          // Also validate additional types if present
          if (entity.additionalTypes) {
            const validAdditional = A.filter(entity.additionalTypes, (t) => O.isSome(ontologyContext.findClass(t)));

            valid.push(
              new ClassifiedEntity({
                ...entity,
                additionalTypes: A.isNonEmptyReadonlyArray(validAdditional) ? validAdditional : undefined,
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

        if (A.isEmptyReadonlyArray(mentions)) {
          return {
            entities: A.empty<ClassifiedEntity>(),
            unclassified: A.empty<ExtractedMention>(),
            invalidTypes: A.empty<ClassifiedEntity>(),
            tokensUsed: 0,
          };
        }

        yield* Effect.logDebug("Classifying entity mentions", {
          mentionCount: mentions.length,
          classCount: ontologyContext.classes.length,
        });

        // Process in batches to avoid token limits
        const batches = A.chunksOf([...mentions], batchSize);
        const allEntities = A.empty<ClassifiedEntity>();
        let totalTokens = 0;

        for (const batch of batches) {
          const prompt = Prompt.make([
            { role: "system" as const, content: buildSystemPrompt() },
            { role: "user" as const, content: buildEntityPrompt(batch, ontologyContext) },
          ]);

          const result = yield* model.generateObject({
            prompt,
            schema: EntityOutput,
            objectName: "EntityOutput",
          });

          // Filter by confidence
          const confidenceFiltered = A.filter(result.value.entities, (e) => e.confidence >= minConfidence);

          allEntities.push(...confidenceFiltered);
          totalTokens += (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);
        }

        // Validate types against ontology
        const { valid, invalid } = validateEntityTypes(allEntities, ontologyContext);

        // Find mentions that weren't classified
        const classifiedMentions = MutableHashSet.empty<string>();
        for (const e of allEntities) {
          MutableHashSet.add(classifiedMentions, Str.toLowerCase(e.mention));
        }
        const unclassified = A.filter(
          [...mentions],
          (m) => !MutableHashSet.has(classifiedMentions, Str.toLowerCase(m.text))
        );

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
          const groups = MutableHashMap.empty<string, { canonical: ClassifiedEntity; mentions: ClassifiedEntity[] }>();

          for (const entity of entities) {
            const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
            const existingOpt = MutableHashMap.get(groups, key);

            if (O.isSome(existingOpt)) {
              const group = existingOpt.value;
              group.mentions.push(entity);

              // Update canonical if this one has higher confidence
              if (entity.confidence > group.canonical.confidence) {
                group.canonical = entity;
              }
            } else {
              MutableHashMap.set(groups, key, {
                canonical: entity,
                mentions: [entity],
              });
            }
          }

          // Convert to native Map for return type compatibility
          const result = new Map<string, { canonical: ClassifiedEntity; mentions: readonly ClassifiedEntity[] }>();
          MutableHashMap.forEach(groups, (value, key) => {
            result.set(key, value);
          });
          return result;
        }),
    };
  }),
}) {}
