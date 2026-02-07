import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel, Prompt } from "@effect/ai";
import * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { buildMentionPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import { FallbackLanguageModel } from "../LlmControl/FallbackLanguageModel";
import { type LlmResilienceError, withLlmResilienceWithFallback } from "../LlmControl/LlmResilience";
import { TextChunk } from "../Nlp/TextChunk";
import { ExtractedMention, MentionOutput } from "./schemas/mention-output.schema";

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

const serviceEffect: Effect.Effect<MentionExtractorShape, never, LanguageModel.LanguageModel | FallbackLanguageModel> =
  Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;
    const fallback = yield* FallbackLanguageModel;

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

      yield* Effect.logDebug("Extracting mentions from chunk", {
        chunkIndex: chunk.index,
        textLength: Str.length(chunk.text),
      });

      const prompt = Prompt.make([
        Prompt.systemMessage({ content: buildSystemPrompt() }),
        Prompt.userMessage({ content: A.make(Prompt.textPart({ text: buildMentionPrompt(chunk.text, chunk.index) })) }),
      ]);

      const result = yield* withLlmResilienceWithFallback(
        model,
        fallback,
        (llm) =>
          llm.generateObject({
            prompt,
            schema: MentionOutput,
            objectName: "MentionOutput",
          }),
        {
          stage: "entity_extraction",
          estimatedTokens: Str.length(chunk.text),
          maxRetries: 1,
        }
      ).pipe(Effect.mapError((error) => mapResilienceError("extractFromChunk", error)));

      const tokensUsed = (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);
      const mentions = extractMentionsFromOutput(result.value, chunk, minConfidence);

      yield* Effect.logDebug("Mention extraction complete", {
        chunkIndex: chunk.index,
        mentionsFound: A.length(mentions),
        tokensUsed,
      });

      return { chunk, mentions, tokensUsed };
    });

    const extractFromChunks = Effect.fnUntraced(function* (
      chunks: readonly TextChunk[],
      config: MentionExtractionConfig = {}
    ) {
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

        const genResult = yield* withLlmResilienceWithFallback(
          model,
          fallback,
          (llm) =>
            llm.generateObject({
              prompt,
              schema: MentionOutput,
              objectName: "MentionOutput",
            }),
          {
            stage: "entity_extraction",
            estimatedTokens: Str.length(chunk.text),
            maxRetries: 1,
          }
        ).pipe(Effect.mapError((error) => mapResilienceError("extractFromChunks", error)));

        const tokensUsed = (genResult.usage.inputTokens ?? 0) + (genResult.usage.outputTokens ?? 0);
        const mentions = extractMentionsFromOutput(genResult.value, chunk, minConfidence);

        results.push({ chunk, mentions, tokensUsed });
      }

      const totalMentions = A.reduce(results, 0, (acc, r) => acc + A.length(r.mentions));
      const totalTokens = A.reduce(results, 0, (acc, r) => acc + r.tokensUsed);

      yield* Effect.logInfo("Mention extraction complete", {
        chunkCount: A.length(chunks),
        totalMentions,
        totalTokens,
      });

      return results;
    });

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
  });

export const MentionExtractorLive = Layer.effect(MentionExtractor, serviceEffect);
