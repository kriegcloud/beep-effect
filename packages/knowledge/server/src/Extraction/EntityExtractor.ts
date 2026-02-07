import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { LanguageModel, Prompt } from "@effect/ai";
import * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { buildEntityPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import { FallbackLanguageModel } from "../LlmControl/FallbackLanguageModel";
import { type LlmResilienceError, withLlmResilienceWithFallback } from "../LlmControl/LlmResilience";
import type { OntologyContext } from "../Ontology";
import { ClassifiedEntity, EntityOutput } from "./schemas/entity-output.schema";
import { ExtractedMention } from "./schemas/mention-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/EntityExtractor");

export class EntityExtractionConfig extends S.Class<EntityExtractionConfig>($I`EntityExtractionConfig`)(
  {
    minConfidence: S.optional(Confidence),
    batchSize: S.optional(S.Number),
  },
  $I.annotations("EntityExtractionConfig", {
    description: "Configuration for entity extraction",
  })
) {}

export class EntityExtractionResult extends S.Class<EntityExtractionResult>($I`EntityExtractionResult`)(
  {
    entities: S.Array(ClassifiedEntity),
    unclassified: S.Array(ExtractedMention),
    invalidTypes: S.Array(ClassifiedEntity),
    tokensUsed: S.Number,
  },
  $I.annotations("EntityExtractionResult", {
    description: "Result of entity extraction",
  })
) {}

export interface EntityExtractorShape {
  readonly classify: (
    mentions: readonly ExtractedMention[],
    ontologyContext: OntologyContext,
    config?: undefined | EntityExtractionConfig
  ) => Effect.Effect<EntityExtractionResult, HttpServerError.RequestError | AiError.AiError>;
  readonly enrichEntities: (
    entities: readonly ClassifiedEntity[],
    ontologyContext: OntologyContext
  ) => Effect.Effect<readonly ClassifiedEntity[], never>;
  readonly resolveEntities: (
    entities: readonly ClassifiedEntity[]
  ) => Effect.Effect<
    ReadonlyMap<string, { readonly canonical: ClassifiedEntity; readonly mentions: readonly ClassifiedEntity[] }>,
    never
  >;
}

export class EntityExtractor extends Context.Tag($I`EntityExtractor`)<EntityExtractor, EntityExtractorShape>() {}

const isTagged = (error: unknown, tag: string): boolean =>
  typeof error === "object" && error !== null && "_tag" in error && (error as { readonly _tag: unknown })._tag === tag;

const mapResilienceError = (
  method: string,
  error: LlmResilienceError<AiError.AiError | HttpServerError.RequestError>
): AiError.AiError | HttpServerError.RequestError => {
  if (isTagged(error, "RequestError")) {
    return error as HttpServerError.RequestError;
  }
  if (
    isTagged(error, "HttpRequestError") ||
    isTagged(error, "HttpResponseError") ||
    isTagged(error, "MalformedInput") ||
    isTagged(error, "MalformedOutput") ||
    isTagged(error, "UnknownError")
  ) {
    return error as AiError.AiError;
  }
  return new AiError.UnknownError({
    module: "EntityExtractor",
    method,
    description: error.message,
    cause: error,
  });
};

const serviceEffect: Effect.Effect<EntityExtractorShape, never, LanguageModel.LanguageModel | FallbackLanguageModel> =
  Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;
    const fallback = yield* FallbackLanguageModel;

    const validateEntityTypes = (
      entities: readonly ClassifiedEntity[],
      ontologyContext: OntologyContext
    ): { readonly valid: readonly ClassifiedEntity[]; readonly invalid: readonly ClassifiedEntity[] } => {
      const [invalid, valid] = A.partition(entities, (entity) => O.isSome(ontologyContext.findClass(entity.typeIri)));

      const validWithFilteredAdditionalTypes = A.map(valid, (entity) => {
        if (!entity.additionalTypes) return entity;
        const validAdditional = A.filter(entity.additionalTypes, (t: string) => O.isSome(ontologyContext.findClass(t)));
        return new ClassifiedEntity({
          ...entity,
          additionalTypes: A.isNonEmptyReadonlyArray(validAdditional) ? validAdditional : undefined,
        });
      });

      return { valid: validWithFilteredAdditionalTypes, invalid };
    };

    const classify = Effect.fnUntraced(function* (
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
        mentionCount: A.length(mentions),
        classCount: A.length(ontologyContext.classes),
      });

      const batches = A.chunksOf([...mentions], batchSize);
      const allEntities = A.empty<ClassifiedEntity>();
      let totalTokens = 0;

      for (const batch of batches) {
        const prompt = Prompt.make([
          Prompt.systemMessage({ content: buildSystemPrompt() }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildEntityPrompt(batch, ontologyContext),
              })
            ),
          }),
        ]);

        const result = yield* withLlmResilienceWithFallback(
          model,
          fallback,
          (llm) =>
            llm.generateObject({
              prompt,
              schema: EntityOutput,
              objectName: "EntityOutput",
            }),
          {
            stage: "entity_extraction",
            estimatedTokens: A.reduce(batch, 0, (acc, mention) => acc + Str.length(mention.text)),
            maxRetries: 1,
          }
        ).pipe(Effect.mapError((error) => mapResilienceError("classify", error)));

        const confidenceFiltered = A.filter(result.value.entities, (e) => e.confidence >= minConfidence);

        allEntities.push(...confidenceFiltered);
        totalTokens += (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);
      }

      const { valid, invalid } = validateEntityTypes(allEntities, ontologyContext);

      const classifiedMentions = F.pipe(
        allEntities,
        A.reduce(MutableHashSet.empty<string>(), (set, e) => {
          MutableHashSet.add(set, Str.toLowerCase(e.mention));
          return set;
        })
      );

      const unclassified = A.filter(
        [...mentions],
        (m) => !MutableHashSet.has(classifiedMentions, Str.toLowerCase(m.text))
      );

      yield* Effect.logDebug("Entity classification complete", {
        validEntities: A.length(valid),
        invalidTypes: A.length(invalid),
        unclassified: A.length(unclassified),
        tokensUsed: totalTokens,
      });

      return {
        entities: valid,
        unclassified,
        invalidTypes: invalid,
        tokensUsed: totalTokens,
      };
    });

    const enrichEntities = (
      entities: readonly ClassifiedEntity[],
      ontologyContext: OntologyContext
    ): Effect.Effect<readonly ClassifiedEntity[], never> =>
      Effect.sync(() =>
        A.map([...entities], (entity) => {
          const classInfo = ontologyContext.findClass(entity.typeIri);
          if (O.isNone(classInfo)) return entity;
          return entity;
        })
      );

    const resolveEntities = (
      entities: readonly ClassifiedEntity[]
    ): Effect.Effect<
      ReadonlyMap<string, { canonical: ClassifiedEntity; mentions: readonly ClassifiedEntity[] }>,
      never
    > =>
      Effect.sync(() => {
        const groups = A.reduce(
          entities,
          MutableHashMap.empty<string, { canonical: ClassifiedEntity; mentions: ClassifiedEntity[] }>(),
          (acc, entity) => {
            const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
            const existingOpt = MutableHashMap.get(acc, key);

            if (O.isSome(existingOpt)) {
              const group = existingOpt.value;
              group.mentions.push(entity);
              if (entity.confidence > group.canonical.confidence) {
                group.canonical = entity;
              }
            } else {
              MutableHashMap.set(acc, key, {
                canonical: entity,
                mentions: [entity],
              });
            }
            return acc;
          }
        );

        const result = new Map<string, { canonical: ClassifiedEntity; mentions: readonly ClassifiedEntity[] }>();
        MutableHashMap.forEach(groups, (value, key) => {
          result.set(key, value);
        });
        return result;
      });

    return EntityExtractor.of({ classify, enrichEntities, resolveEntities });
  });

export const EntityExtractorLive = Layer.effect(EntityExtractor, serviceEffect);
