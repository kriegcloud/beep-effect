import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/values";
import { LanguageModel, Prompt } from "@effect/ai";
import * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
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
import type { OntologyContext } from "../Ontology";
import { getErrorMessage, getErrorTag, getModelMetadata, mapResilienceError } from "../utils";
import { ClassifiedEntity, EntityOutput } from "./schemas/entity-output.schema";
import { ExtractedMention } from "./schemas/mention-output.schema";
import { EntityOutputWire, stripNullProperties } from "./schemas/openai-wire";

const $I = $KnowledgeServerId.create("Extraction/EntityExtractor");

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

const annotateFailureOnCurrentSpan = (error: unknown): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Effect.annotateCurrentSpan("outcome.success", false);
    yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(error));
    yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(error));
  });

const serviceEffect: Effect.Effect<EntityExtractorShape, never, LanguageModel.LanguageModel> = Effect.gen(function* () {
  const model = yield* LanguageModel.LanguageModel;
  const llm = getModelMetadata(model);

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

  const classify = Effect.fnUntraced(
    function* (
      mentions: readonly ExtractedMention[],
      ontologyContext: OntologyContext,
      config: EntityExtractionConfig = {}
    ) {
      yield* Effect.annotateCurrentSpan("llm.provider", llm.provider);
      yield* Effect.annotateCurrentSpan("llm.model", llm.model);
      yield* Effect.annotateCurrentSpan("knowledge.mention.count", A.length(mentions));
      const minConfidence = config.minConfidence ?? 0.5;
      const batchSize = config.batchSize ?? 20;
      yield* Effect.annotateCurrentSpan("knowledge.entity.batch_size", batchSize);

      if (A.isEmptyReadonlyArray(mentions)) {
        yield* Effect.annotateCurrentSpan("outcome.success", true);
        yield* Effect.annotateCurrentSpan("knowledge.entity.count", 0);
        yield* Effect.annotateCurrentSpan("knowledge.entity.invalid_count", 0);
        yield* Effect.annotateCurrentSpan("knowledge.entity.unclassified_count", 0);
        yield* Effect.annotateCurrentSpan("llm.status", "skipped");
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

      for (const [batchIndex, batch] of batches.entries()) {
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
        const rawResult = yield* model
          .generateObject({
            prompt,
            schema: EntityOutputWire,
            objectName: "EntityOutput",
          })
          .pipe(
            Effect.mapError((error) => mapResilienceError("classify", error)),
            Effect.tap((result) =>
              Effect.gen(function* () {
                const inputTokens = result.usage.inputTokens ?? 0;
                const outputTokens = result.usage.outputTokens ?? 0;
                yield* Effect.annotateCurrentSpan("llm.status", "success");
                yield* Effect.annotateCurrentSpan("llm.input_tokens", inputTokens);
                yield* Effect.annotateCurrentSpan("llm.output_tokens", outputTokens);
                yield* Effect.annotateCurrentSpan("llm.tokens_total", inputTokens + outputTokens);
              })
            ),
            Effect.tapError((error) =>
              Effect.gen(function* () {
                yield* annotateFailureOnCurrentSpan(error);
                yield* Effect.annotateCurrentSpan("llm.status", "error");
              })
            ),
            Effect.withSpan("knowledge.entity_extractor.llm_call", {
              attributes: {
                "llm.provider": llm.provider,
                "llm.model": llm.model,
                "llm.operation": "entity_classification",
                "knowledge.entity.batch_index": batchIndex,
                "knowledge.entity.batch_size": A.length(batch),
              },
            })
          );

        const entityOutput = yield* S.decodeUnknown(EntityOutput)(stripNullProperties(rawResult.value)).pipe(
          Effect.mapError((error) =>
            AiError.MalformedOutput.fromParseError({
              module: "EntityExtractor",
              method: "classify",
              error,
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan)
        );

        const confidenceFiltered = A.filter(entityOutput.entities, (e) => e.confidence >= minConfidence);

        allEntities.push(...confidenceFiltered);
        totalTokens += (rawResult.usage.inputTokens ?? 0) + (rawResult.usage.outputTokens ?? 0);
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
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.entity.count", A.length(valid));
      yield* Effect.annotateCurrentSpan("knowledge.entity.invalid_count", A.length(invalid));
      yield* Effect.annotateCurrentSpan("knowledge.entity.unclassified_count", A.length(unclassified));
      yield* Effect.annotateCurrentSpan("llm.tokens_total", totalTokens);

      return {
        entities: valid,
        unclassified,
        invalidTypes: invalid,
        tokensUsed: totalTokens,
      };
    },
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        yield* Effect.annotateCurrentSpan("llm.status", "error");
        return yield* Effect.failCause(cause);
      })
    ),
    Effect.withSpan("knowledge.entity_extractor.classify")
  );

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
