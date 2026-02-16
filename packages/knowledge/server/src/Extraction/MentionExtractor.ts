import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel, Prompt } from "@effect/ai";
import * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { buildMentionPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import { type LlmResilienceError, withLlmResilience } from "../LlmControl/LlmResilience";
import { TextChunk } from "../Nlp/TextChunk";
import { ExtractedMention, MentionOutput } from "./schemas/mention-output.schema";
import { MentionOutputWire, stripNullProperties } from "./schemas/openai-wire";

const $I = $KnowledgeServerId.create("Extraction/MentionExtractor");

export class MentionExtractionConfig extends S.Class<MentionExtractionConfig>($I`MentionExtractionConfig`)(
  {
    minConfidence: S.optional(S.Number),
  },
  $I.annotations("MentionExtractionConfig", {
    description: "Mention extraction configuration (minimum confidence threshold).",
  })
) {}

export class MentionExtractionResult extends S.Class<MentionExtractionResult>($I`MentionExtractionResult`)(
  {
    chunk: TextChunk,
    mentions: S.Array(ExtractedMention),
    tokensUsed: S.NonNegativeInt,
  },
  $I.annotations("MentionExtractionResult", {
    description: "Mention extraction result for a single chunk (chunk + extracted mentions + tokens used).",
  })
) {}

export interface MentionExtractorShape {
  readonly extractFromChunk: (
    chunk: TextChunk,
    config?: MentionExtractionConfig
  ) => Effect.Effect<MentionExtractionResult, AiError.AiError | HttpServerError.RequestError>;
  readonly extractFromChunks: (
    chunks: readonly TextChunk[],
    config?: MentionExtractionConfig
  ) => Effect.Effect<readonly MentionExtractionResult[], AiError.AiError | HttpServerError.RequestError>;
  readonly mergeMentions: (
    results: readonly MentionExtractionResult[]
  ) => Effect.Effect<readonly ExtractedMention[], never>;
}

export class MentionExtractor extends Context.Tag($I`MentionExtractor`)<MentionExtractor, MentionExtractorShape>() {}

const isTagged = (error: unknown, tag: string): boolean =>
  typeof error === "object" && error !== null && "_tag" in error && (error as { readonly _tag: unknown })._tag === tag;

const readStringProp = (input: unknown, key: string): O.Option<string> =>
  typeof input === "object" &&
  input !== null &&
  key in input &&
  typeof (input as Record<string, unknown>)[key] === "string"
    ? O.some((input as Record<string, unknown>)[key] as string)
    : O.none();

const resolveStringOrUnknown = (option: O.Option<string>): string =>
  O.match(option, {
    onNone: () => "unknown",
    onSome: (value) => value,
  });

const getModelMetadata = (model: unknown): { readonly provider: string; readonly model: string } => ({
  provider: resolveStringOrUnknown(O.orElse(readStringProp(model, "provider"), () => readStringProp(model, "_tag"))),
  model: resolveStringOrUnknown(
    O.orElse(
      O.orElse(readStringProp(model, "model"), () => readStringProp(model, "modelId")),
      () => readStringProp(model, "id")
    )
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
    module: "MentionExtractor",
    method,
    description: error.message,
    cause: error,
  });
};

const serviceEffect: Effect.Effect<MentionExtractorShape, never, LanguageModel.LanguageModel> = Effect.gen(
  function* () {
    const model = yield* LanguageModel.LanguageModel;
    const llm = getModelMetadata(model);

    const extractMentionsFromOutput = (
      result: MentionOutput,
      chunk: TextChunk,
      minConfidence: number
    ): readonly ExtractedMention[] =>
      A.filterMap(result.mentions, (m): O.Option<ExtractedMention> => {
        if (m.confidence < minConfidence) return O.none();
        return O.some(
          new ExtractedMention({
            text: m.text,
            startChar: m.startChar + chunk.startOffset,
            endChar: m.endChar + chunk.startOffset,
            confidence: m.confidence,
            suggestedType: m.suggestedType,
            context: m.context,
          })
        );
      });

    const extractFromChunk = Effect.fnUntraced(function* (chunk: TextChunk, config: MentionExtractionConfig = {}) {
      const minConfidence = config.minConfidence ?? 0.5;
      yield* Effect.annotateCurrentSpan("llm.provider", llm.provider);
      yield* Effect.annotateCurrentSpan("llm.model", llm.model);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.index", chunk.index);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.text_length", Str.length(chunk.text));

      yield* Effect.logDebug("Extracting mentions from chunk", {
        chunkIndex: chunk.index,
        textLength: Str.length(chunk.text),
      });

      const prompt = Prompt.make([
        Prompt.systemMessage({ content: buildSystemPrompt() }),
        Prompt.userMessage({ content: A.make(Prompt.textPart({ text: buildMentionPrompt(chunk.text, chunk.index) })) }),
      ]);

      const rawResult = yield* withLlmResilience(
        model.generateObject({
          prompt,
          schema: MentionOutputWire,
          objectName: "MentionOutput",
        }),
        {
          stage: "entity_extraction",
          estimatedTokens: Str.length(chunk.text),
          maxRetries: 1,
        }
      ).pipe(
        Effect.mapError((error) => mapResilienceError("extractFromChunk", error)),
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
        Effect.withSpan("knowledge.mention_extractor.llm_call", {
          attributes: {
            "llm.provider": llm.provider,
            "llm.model": llm.model,
            "llm.operation": "mention_extract_chunk",
            "knowledge.chunk.index": chunk.index,
            "knowledge.chunk.text_length": Str.length(chunk.text),
          },
        })
      );

      const mentionOutput = yield* S.decodeUnknown(MentionOutput)(stripNullProperties(rawResult.value)).pipe(
        Effect.mapError((error) =>
          AiError.MalformedOutput.fromParseError({
            module: "MentionExtractor",
            method: "extractFromChunk",
            error,
          })
        ),
        Effect.tapError(annotateFailureOnCurrentSpan)
      );
      const tokensUsed = (rawResult.usage.inputTokens ?? 0) + (rawResult.usage.outputTokens ?? 0);
      const mentions = extractMentionsFromOutput(mentionOutput, chunk, minConfidence);

      yield* Effect.logDebug("Mention extraction complete", {
        chunkIndex: chunk.index,
        mentionsFound: A.length(mentions),
        tokensUsed,
      });
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.mention.count", A.length(mentions));
      yield* Effect.annotateCurrentSpan("llm.tokens_total", tokensUsed);

      return { chunk, mentions, tokensUsed };
    }, Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        yield* Effect.annotateCurrentSpan("llm.status", "error");
        return yield* Effect.failCause(cause);
      })
    ), Effect.withSpan("knowledge.mention_extractor.extract_from_chunk"));

    const extractFromChunks = Effect.fnUntraced(function* (
      chunks: readonly TextChunk[],
      config: MentionExtractionConfig = {}
    ) {
      yield* Effect.annotateCurrentSpan("llm.provider", llm.provider);
      yield* Effect.annotateCurrentSpan("llm.model", llm.model);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.count", A.length(chunks));
      yield* Effect.logInfo("Extracting mentions from chunks", {
        chunkCount: A.length(chunks),
      });

      const minConfidence = config.minConfidence ?? 0.5;
      const results = A.empty<MentionExtractionResult>();

      for (const chunk of chunks) {
        const prompt = Prompt.make([
          Prompt.systemMessage({ content: buildSystemPrompt() }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildMentionPrompt(chunk.text, chunk.index),
              })
            ),
          }),
        ]);

        const genResult = yield* withLlmResilience(
          model.generateObject({
            prompt,
            schema: MentionOutputWire,
            objectName: "MentionOutput",
          }),
          {
            stage: "entity_extraction",
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
          Effect.withSpan("knowledge.mention_extractor.llm_call", {
            attributes: {
              "llm.provider": llm.provider,
              "llm.model": llm.model,
              "llm.operation": "mention_extract_chunks",
              "knowledge.chunk.index": chunk.index,
              "knowledge.chunk.text_length": Str.length(chunk.text),
            },
          })
        );

        const mentionOutput = yield* S.decodeUnknown(MentionOutput)(stripNullProperties(genResult.value)).pipe(
          Effect.mapError((error) =>
            AiError.MalformedOutput.fromParseError({
              module: "MentionExtractor",
              method: "extractFromChunks",
              error,
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan)
        );
        const tokensUsed = (genResult.usage.inputTokens ?? 0) + (genResult.usage.outputTokens ?? 0);
        const mentions = extractMentionsFromOutput(mentionOutput, chunk, minConfidence);

        results.push({ chunk, mentions, tokensUsed });
      }

      const totalMentions = A.reduce(results, 0, (acc, r) => acc + A.length(r.mentions));
      const totalTokens = A.reduce(results, 0, (acc, r) => acc + r.tokensUsed);

      yield* Effect.logInfo("Mention extraction complete", {
        chunkCount: A.length(chunks),
        totalMentions,
        totalTokens,
      });
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.mention.count", totalMentions);
      yield* Effect.annotateCurrentSpan("llm.tokens_total", totalTokens);

      return results;
    }, Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        yield* Effect.annotateCurrentSpan("llm.status", "error");
        return yield* Effect.failCause(cause);
      })
    ), Effect.withSpan("knowledge.mention_extractor.extract_from_chunks"));

    const mergeMentions = (
      results: readonly MentionExtractionResult[]
    ): Effect.Effect<readonly ExtractedMention[], never> =>
      Effect.sync(() => {
        const allMentions = A.flatMap([...results], (r): readonly ExtractedMention[] => r.mentions);

        const sorted = A.sort(
          allMentions,
          Order.combine(
            Order.mapInput(Order.number, (m: ExtractedMention) => m.startChar),
            Order.reverse(Order.mapInput(Order.number, (m: ExtractedMention) => m.confidence))
          )
        );

        const { merged } = A.reduce(
          sorted,
          { merged: A.empty<ExtractedMention>(), lastEndChar: -1 },
          (acc, mention) => {
            if (mention.startChar >= acc.lastEndChar) {
              acc.merged.push(mention);
              return { merged: acc.merged, lastEndChar: mention.endChar };
            }
            return acc;
          }
        );

        return merged;
      });

    return MentionExtractor.of({ extractFromChunk, extractFromChunks, mergeMentions });
  }
);

export const MentionExtractorLive = Layer.effect(MentionExtractor, serviceEffect);
