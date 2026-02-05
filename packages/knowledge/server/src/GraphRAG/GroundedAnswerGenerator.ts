import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel } from "@effect/ai";
import * as Prompt from "@effect/ai/Prompt";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CentralRateLimiterService } from "../LlmControl/RateLimiter";
import type { Citation } from "./AnswerSchemas";
import { GroundedAnswer } from "./AnswerSchemas";
import { extractEntityIds, parseCitations, stripAllCitations } from "./CitationParser";
import { buildGroundedAnswerPrompt, type GraphContext } from "./PromptTemplates";

const $I = $KnowledgeServerId.create("GraphRAG/GroundedAnswerGenerator");

export class GenerationError extends S.TaggedError<GenerationError>()("GenerationError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

const computeConfidence = (citations: ReadonlyArray<Citation>): number => {
  if (A.isEmptyReadonlyArray(citations)) {
    return 0.0;
  }

  const sum = A.reduce(citations, 0, (acc, c) => acc + c.confidence);
  return sum / A.length(citations);
};

export interface GroundedAnswerGeneratorShape {
  readonly generate: (context: GraphContext, question: string) => Effect.Effect<GroundedAnswer, GenerationError>;
}

export class GroundedAnswerGenerator extends Context.Tag($I`GroundedAnswerGenerator`)<
  GroundedAnswerGenerator,
  GroundedAnswerGeneratorShape
>() {}

const serviceEffect: Effect.Effect<
  GroundedAnswerGeneratorShape,
  never,
  LanguageModel.LanguageModel | CentralRateLimiterService
> = Effect.gen(function* () {
  const languageModel = yield* LanguageModel.LanguageModel;
  const limiter = yield* CentralRateLimiterService;

  const generate = (context: GraphContext, question: string): Effect.Effect<GroundedAnswer, GenerationError> =>
    Effect.gen(function* () {
      yield* Effect.logInfo("GroundedAnswerGenerator.generate: starting").pipe(
        Effect.annotateLogs({
          entityCount: A.length(context.entities),
          relationCount: A.length(context.relations),
          questionLength: Str.length(question),
        })
      );

      const prompts = buildGroundedAnswerPrompt(context, question);

      yield* Effect.logDebug("GroundedAnswerGenerator.generate: prompts built").pipe(
        Effect.annotateLogs({
          systemPromptLength: Str.length(prompts.system),
          userPromptLength: Str.length(prompts.user),
        })
      );

      const estimatedTokens = Str.length(prompts.system) + Str.length(prompts.user);
      yield* limiter.acquire(estimatedTokens);

      const response = yield* languageModel
        .generateText({
          prompt: Prompt.make([
            Prompt.systemMessage({ content: prompts.system }),
            Prompt.userMessage({
              content: A.make(Prompt.textPart({ text: prompts.user })),
            }),
          ]),
        })
        .pipe(
          Effect.tap(() => limiter.release(0, true)),
          Effect.tapError(() => limiter.release(0, false))
        );

      yield* Effect.logDebug("GroundedAnswerGenerator.generate: LLM response received").pipe(
        Effect.annotateLogs({
          textLength: Str.length(response.text),
          hasToolCalls: A.length(response.toolCalls) > 0,
        })
      );

      const responseText = response.text;

      if (Str.length(Str.trim(responseText)) === 0) {
        yield* Effect.logWarning("GroundedAnswerGenerator.generate: empty response from LLM");
        return new GroundedAnswer({
          text: "I don't have enough information to answer this question." as string & {
            readonly NonEmptyString: unique symbol;
          },
          citations: [],
          confidence: 0.0,
          reasoning: undefined,
        });
      }

      const contextEntityIds = A.map(context.entities, (e) => e.id);
      const citations = parseCitations(responseText, contextEntityIds);

      yield* Effect.logDebug("GroundedAnswerGenerator.generate: citations parsed").pipe(
        Effect.annotateLogs({
          citationCount: A.length(citations),
          extractedEntityIds: A.length(extractEntityIds(responseText)),
        })
      );

      const confidence = computeConfidence(citations);

      const cleanText = stripAllCitations(responseText);

      yield* Effect.logInfo("GroundedAnswerGenerator.generate: complete").pipe(
        Effect.annotateLogs({
          citationCount: A.length(citations),
          confidence,
          textLength: Str.length(cleanText),
        })
      );

      return new GroundedAnswer({
        text: cleanText,
        citations: A.fromIterable(citations),
        confidence,
        reasoning: undefined,
      });
    }).pipe(
      Effect.mapError(
        (e) =>
          new GenerationError({
            message: `Failed to generate grounded answer: ${String(e)}`,
            cause: e,
          })
      ),
      Effect.withSpan("GroundedAnswerGenerator.generate", {
        captureStackTrace: false,
        attributes: {
          entityCount: A.length(context.entities),
          relationCount: A.length(context.relations),
        },
      })
    );

  return GroundedAnswerGenerator.of({ generate });
});

export const GroundedAnswerGeneratorLive = Layer.effect(GroundedAnswerGenerator, serviceEffect);

export type { GraphContext } from "./PromptTemplates";
