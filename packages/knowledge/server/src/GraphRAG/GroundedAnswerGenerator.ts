import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel } from "@effect/ai";
import * as Prompt from "@effect/ai/Prompt";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FallbackLanguageModel } from "../LlmControl/FallbackLanguageModel";
import { withLlmResilienceWithFallback } from "../LlmControl/LlmResilience";
import type { Citation } from "./AnswerSchemas";
import { GroundedAnswer } from "./AnswerSchemas";
import { extractEntityIds, parseCitations, stripAllCitations } from "./CitationParser";
import { buildGroundedAnswerPrompt, type GraphContext } from "./PromptTemplates";

const $I = $KnowledgeServerId.create("GraphRAG/GroundedAnswerGenerator");

export class GenerationError extends S.TaggedError<GenerationError>($I`GenerationError`)(
  "GenerationError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("GenerationError", {
    description: "Failure while generating a grounded answer (LLM call, parsing, or validation).",
  })
) {}

const DEFAULT_EMPTY_ANSWER_TEXT = S.decodeSync(S.NonEmptyString)(
  "I don't have enough information to answer this question."
);

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
  LanguageModel.LanguageModel | FallbackLanguageModel
> = Effect.gen(function* () {
  const model = yield* LanguageModel.LanguageModel;
  const fallback = yield* FallbackLanguageModel;

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
      const response = yield* withLlmResilienceWithFallback(
        model,
        fallback,
        (llm) =>
          llm.generateText({
            prompt: Prompt.make([
              Prompt.systemMessage({ content: prompts.system }),
              Prompt.userMessage({
                content: A.make(Prompt.textPart({ text: prompts.user })),
              }),
            ]),
          }),
        {
          stage: "grounding",
          estimatedTokens,
          maxRetries: 1,
        }
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
          text: DEFAULT_EMPTY_ANSWER_TEXT,
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
