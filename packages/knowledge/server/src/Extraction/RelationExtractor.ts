import { $KnowledgeServerId } from "@beep/identity/packages";
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
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { buildRelationPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import { type LlmResilienceError, withLlmResilience } from "../LlmControl/LlmResilience";
import type { TextChunk } from "../Nlp/TextChunk";
import type { OntologyContext } from "../Ontology";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import { ExtractedTriple, RelationOutput } from "./schemas/relation-output.schema";
import { RelationOutputWire, stripNullProperties } from "./schemas/openai-wire";

const $I = $KnowledgeServerId.create("Extraction/RelationExtractor");

export class RelationExtractionConfig extends S.Class<RelationExtractionConfig>($I`RelationExtractionConfig`)(
  {
    minConfidence: S.optional(S.Number),
    validatePredicates: S.optional(S.Boolean),
  },
  $I.annotations("RelationExtractionConfig", {
    description: "Relation extraction configuration",
  })
) {}

export class RelationExtractionResult extends S.Class<RelationExtractionResult>($I`RelationExtractionResult`)(
  {
    triples: S.Array(ExtractedTriple),
    invalidTriples: S.Array(ExtractedTriple),
    tokensUsed: S.Number,
  },
  $I.annotations("RelationExtractionResult", {
    description: "Result of relation extraction (triples, invalid triples, tokens used).",
  })
) {}

export interface RelationExtractorShape {
  readonly extract: (
    entities: readonly ClassifiedEntity[],
    chunk: TextChunk,
    ontologyContext: OntologyContext,
    config?: undefined | RelationExtractionConfig
  ) => Effect.Effect<RelationExtractionResult, AiError.AiError | HttpServerError.RequestError>;
  readonly extractFromChunks: (
    entitiesByChunk: MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]>,
    chunks: readonly TextChunk[],
    ontologyContext: OntologyContext,
    config?: undefined | RelationExtractionConfig
  ) => Effect.Effect<RelationExtractionResult, AiError.AiError | HttpServerError.RequestError>;
  readonly deduplicateRelations: (
    triples: readonly ExtractedTriple[]
  ) => Effect.Effect<readonly ExtractedTriple[], never>;
}

export class RelationExtractor extends Context.Tag($I`RelationExtractor`)<
  RelationExtractor,
  RelationExtractorShape
>() {}

const isTagged = (error: unknown, tag: string): boolean =>
  typeof error === "object" && error !== null && "_tag" in error && (error as { readonly _tag: unknown })._tag === tag;

const readStringProp = (input: unknown, key: string): O.Option<string> =>
  typeof input === "object" &&
  input !== null &&
  key in input &&
  typeof (input as Record<string, unknown>)[key] === "string"
    ? O.some((input as Record<string, unknown>)[key] as string)
    : O.none();

const getModelMetadata = (model: unknown): { readonly provider: string; readonly model: string } => ({
  provider: F.pipe(
    readStringProp(model, "provider"),
    O.orElse(() => readStringProp(model, "_tag")),
    O.getOrElse(() => "unknown")
  ),
  model: F.pipe(
    readStringProp(model, "model"),
    O.orElse(() => readStringProp(model, "modelId")),
    O.orElse(() => readStringProp(model, "id")),
    O.getOrElse(() => "unknown")
  ),
});

const getErrorTag = (error: unknown): string =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  typeof (error as { readonly _tag: unknown })._tag === "string"
    ? ((error as { readonly _tag: string })._tag ?? "UnknownError")
    : "UnknownError";

const getErrorMessage = (error: unknown): string => {
  const raw =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { readonly message: unknown }).message === "string"
      ? (error as { readonly message: string }).message
      : String(error);
  const collapsed = raw.replace(/\s+/g, " ").trim();
  const statusMatch = collapsed.match(/\b([45]\d{2})\b/);
  return statusMatch !== null ? `http_status=${statusMatch[1]} len=${collapsed.length}` : `len=${collapsed.length}`;
};

const annotateFailureOnCurrentSpan = (error: unknown): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Effect.annotateCurrentSpan("outcome.success", false);
    yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(error));
    yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(error));
  });

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
    module: "RelationExtractor",
    method,
    description: error.message,
    cause: error,
  });
};

const serviceEffect: Effect.Effect<RelationExtractorShape, never, LanguageModel.LanguageModel> = Effect.gen(
  function* () {
    const model = yield* LanguageModel.LanguageModel;
    const llm = getModelMetadata(model);

    const partitionByPredicateValidity = (
      triples: readonly ExtractedTriple[],
      ontologyContext: OntologyContext
    ): { readonly valid: readonly ExtractedTriple[]; readonly invalid: readonly ExtractedTriple[] } => {
      const [invalid, valid] = A.partition(triples, (triple) =>
        O.isSome(ontologyContext.findProperty(triple.predicateIri))
      );
      return { valid, invalid };
    };

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

    const tripleDeduplicationKey = (triple: ExtractedTriple): string => {
      const objectPart = triple.objectMention ?? triple.literalValue ?? "";
      return Str.toLowerCase([triple.subjectMention, triple.predicateIri, objectPart].join("|"));
    };

    const extract = Effect.fnUntraced(function* (
      entities: readonly ClassifiedEntity[],
      chunk: TextChunk,
      ontologyContext: OntologyContext,
      config: RelationExtractionConfig = {}
    ) {
      yield* Effect.annotateCurrentSpan("llm.provider", llm.provider);
      yield* Effect.annotateCurrentSpan("llm.model", llm.model);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.index", chunk.index);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.text_length", Str.length(chunk.text));
      yield* Effect.annotateCurrentSpan("knowledge.entity.count", A.length(entities));
      const minConfidence = config.minConfidence ?? 0.5;
      const shouldValidate = config.validatePredicates ?? true;

      if (A.isEmptyReadonlyArray(entities)) {
        yield* Effect.logDebug("Skipping relation extraction - insufficient entities", {
          entityCount: A.length(entities),
        });
        yield* Effect.annotateCurrentSpan("outcome.success", true);
        yield* Effect.annotateCurrentSpan("llm.status", "skipped");
        yield* Effect.annotateCurrentSpan("knowledge.relation.count", 0);
        yield* Effect.annotateCurrentSpan("knowledge.relation.invalid_count", 0);

        return {
          triples: A.empty<ExtractedTriple>(),
          invalidTriples: A.empty<ExtractedTriple>(),
          tokensUsed: 0,
        };
      }

      yield* Effect.logDebug("Extracting relations", {
        entityCount: A.length(entities),
        chunkIndex: chunk.index,
        propertyCount: A.length(ontologyContext.properties),
      });

      const prompt = Prompt.make([
        Prompt.systemMessage({ content: buildSystemPrompt() }),
        Prompt.userMessage({
          content: A.make(
            Prompt.textPart({
              text: buildRelationPrompt([...entities], chunk.text, ontologyContext),
            })
          ),
        }),
      ]);

      const rawResult = yield* withLlmResilience(
        model.generateObject({
          prompt,
          schema: RelationOutputWire,
          objectName: "RelationOutput",
        }),
        {
          stage: "relation_extraction",
          estimatedTokens: Str.length(chunk.text),
          maxRetries: 1,
        }
      ).pipe(
        Effect.mapError((error) => mapResilienceError("extract", error)),
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
        Effect.withSpan("knowledge.relation_extractor.llm_call", {
          attributes: {
            "llm.provider": llm.provider,
            "llm.model": llm.model,
            "llm.operation": "relation_extract_chunk",
            "knowledge.chunk.index": chunk.index,
            "knowledge.chunk.text_length": Str.length(chunk.text),
            "knowledge.entity.count": A.length(entities),
          },
        })
      );

      const relationOutput = yield* S.decodeUnknown(RelationOutput)(stripNullProperties(rawResult.value)).pipe(
        Effect.mapError((error) =>
          AiError.MalformedOutput.fromParseError({
            module: "RelationExtractor",
            method: "extract",
            error,
          })
        ),
        Effect.tapError(annotateFailureOnCurrentSpan)
      );

      const tokensUsed = (rawResult.usage.inputTokens ?? 0) + (rawResult.usage.outputTokens ?? 0);

      const offsetAdjusted = F.pipe(
        relationOutput.triples,
        A.filter((t) => t.confidence >= minConfidence),
        A.map((t) => adjustOffsets(t, chunk.startOffset))
      );

      const { valid, invalid } = shouldValidate
        ? partitionByPredicateValidity(offsetAdjusted, ontologyContext)
        : { valid: offsetAdjusted, invalid: A.empty<ExtractedTriple>() };

      yield* Effect.logDebug("Relation extraction complete", {
        validTriples: A.length(valid),
        invalidTriples: A.length(invalid),
        tokensUsed,
      });
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.relation.count", A.length(valid));
      yield* Effect.annotateCurrentSpan("knowledge.relation.invalid_count", A.length(invalid));
      yield* Effect.annotateCurrentSpan("llm.tokens_total", tokensUsed);

      return { triples: valid, invalidTriples: invalid, tokensUsed };
    }, Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        yield* Effect.annotateCurrentSpan("llm.status", "error");
        return yield* Effect.failCause(cause);
      })
    ), Effect.withSpan("knowledge.relation_extractor.extract"));

    const extractFromChunks = Effect.fnUntraced(function* (
      entitiesByChunk: MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]>,
      chunks: readonly TextChunk[],
      ontologyContext: OntologyContext,
      config: RelationExtractionConfig = {}
    ) {
      yield* Effect.annotateCurrentSpan("llm.provider", llm.provider);
      yield* Effect.annotateCurrentSpan("llm.model", llm.model);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.count", A.length(chunks));
      const allTriples = A.empty<ExtractedTriple>();
      const allInvalid = A.empty<ExtractedTriple>();
      let totalTokens = 0;

      const minConfidence = config.minConfidence ?? 0.5;
      const shouldValidate = config.validatePredicates ?? true;

      for (const chunk of chunks) {
        const entities = F.pipe(
          MutableHashMap.get(entitiesByChunk, chunk.index),
          O.getOrElse(() => A.empty<ClassifiedEntity>())
        );

        if (A.isEmptyReadonlyArray(entities)) continue;

        const prompt = Prompt.make([
          Prompt.systemMessage({ content: buildSystemPrompt() }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildRelationPrompt([...entities], chunk.text, ontologyContext),
              })
            ),
          }),
        ]);

        const aiRawResult = yield* withLlmResilience(
          model.generateObject({
            prompt,
            schema: RelationOutputWire,
            objectName: "RelationOutput",
          }),
          {
            stage: "relation_extraction",
            estimatedTokens: Str.length(chunk.text),
            maxRetries: 1,
          }
        ).pipe(
          Effect.mapError((error) => mapResilienceError("extractFromChunks", error)),
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
          Effect.withSpan("knowledge.relation_extractor.llm_call", {
            attributes: {
              "llm.provider": llm.provider,
              "llm.model": llm.model,
              "llm.operation": "relation_extract_chunks",
              "knowledge.chunk.index": chunk.index,
              "knowledge.chunk.text_length": Str.length(chunk.text),
              "knowledge.entity.count": A.length(entities),
            },
          })
        );

        const aiRelationOutput = yield* S.decodeUnknown(RelationOutput)(stripNullProperties(aiRawResult.value)).pipe(
          Effect.mapError((error) =>
            AiError.MalformedOutput.fromParseError({
              module: "RelationExtractor",
              method: "extractFromChunks",
              error,
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan)
        );

        const offsetAdjusted = F.pipe(
          aiRelationOutput.triples,
          A.filter((t) => t.confidence >= minConfidence),
          A.map((t) => adjustOffsets(t, chunk.startOffset))
        );

        if (shouldValidate) {
          const { valid, invalid } = partitionByPredicateValidity(offsetAdjusted, ontologyContext);
          allTriples.push(...valid);
          allInvalid.push(...invalid);
        } else {
          allTriples.push(...offsetAdjusted);
        }

        totalTokens += (aiRawResult.usage.inputTokens ?? 0) + (aiRawResult.usage.outputTokens ?? 0);
      }

      yield* Effect.logInfo("Relation extraction from chunks complete", {
        chunkCount: A.length(chunks),
        totalTriples: A.length(allTriples),
        invalidTriples: A.length(allInvalid),
        tokensUsed: totalTokens,
      });
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.relation.count", A.length(allTriples));
      yield* Effect.annotateCurrentSpan("knowledge.relation.invalid_count", A.length(allInvalid));
      yield* Effect.annotateCurrentSpan("llm.tokens_total", totalTokens);

      return { triples: allTriples, invalidTriples: allInvalid, tokensUsed: totalTokens };
    }, Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        yield* Effect.annotateCurrentSpan("llm.status", "error");
        return yield* Effect.failCause(cause);
      })
    ), Effect.withSpan("knowledge.relation_extractor.extract_from_chunks"));

    const deduplicateRelations = (
      triples: readonly ExtractedTriple[]
    ): Effect.Effect<readonly ExtractedTriple[], never> =>
      Effect.sync(() => {
        const seen = A.reduce(triples, MutableHashMap.empty<string, ExtractedTriple>(), (acc, triple) => {
          const key = tripleDeduplicationKey(triple);
          const existingOpt = MutableHashMap.get(acc, key);
          if (O.isNone(existingOpt) || triple.confidence > existingOpt.value.confidence) {
            MutableHashMap.set(acc, key, triple);
          }
          return acc;
        });

        const result = A.empty<ExtractedTriple>();
        MutableHashMap.forEach(seen, (triple) => {
          result.push(triple);
        });
        return result;
      });

    return RelationExtractor.of({ extract, extractFromChunks, deduplicateRelations });
  }
);

export const RelationExtractorLive = Layer.effect(RelationExtractor, serviceEffect);
