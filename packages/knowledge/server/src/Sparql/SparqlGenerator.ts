import { $KnowledgeServerId } from "@beep/identity/packages";
import {
  type SparqlSyntaxError,
  type SparqlUnsupportedFeatureError,
  SparqlUnsupportedFeatureError as Unsupported,
} from "@beep/knowledge-domain/errors";
import { LanguageModel } from "@effect/ai";
import * as Prompt from "@effect/ai/Prompt";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FallbackLanguageModel } from "../LlmControl/FallbackLanguageModel";
import { withLlmResilienceWithFallback } from "../LlmControl/LlmResilience";
import { buildSparqlGenerationUserPrompt, SPARQL_GENERATION_SYSTEM_PROMPT } from "./SparqlGeneratorPrompt";
import { SparqlParser, SparqlParserLive } from "./SparqlParser";

const $I = $KnowledgeServerId.create("Sparql/SparqlGenerator");

const MAX_PARSE_RETRIES = 3;

const WRITE_OPERATION_PATTERN =
  /\b(INSERT|DELETE|UPDATE|LOAD|CLEAR|CREATE|DROP|MOVE|COPY|ADD|WITH|USING|USING\s+NAMED)\b/i;

export class SparqlGenerationError extends S.TaggedError<SparqlGenerationError>()("SparqlGenerationError", {
  question: S.String,
  message: S.String,
  attempts: S.Int,
}) {}
export class SparqlGenerationResult extends S.Class<SparqlGenerationResult>($I`SparqlGenerationResult`)({
  query: S.String,
  attempts: S.Int,
}) {}


export interface SparqlGeneratorShape {
  readonly generateReadOnlyQuery: (
    question: string,
    schemaContext: string
  ) => Effect.Effect<SparqlGenerationResult, SparqlGenerationError | SparqlSyntaxError | SparqlUnsupportedFeatureError>;
}

export class SparqlGenerator extends Context.Tag($I`SparqlGenerator`)<SparqlGenerator, SparqlGeneratorShape>() {}

const extractQueryText = (raw: string): string => {
  const trimmed = Str.trim(raw);
  const fenced = trimmed.match(/```(?:sparql)?\s*([\s\S]*?)```/i);
  return Str.trim(fenced?.[1] ?? trimmed);
};

const failWriteOperation = (query: string): Unsupported =>
  new Unsupported({
    feature: "write operation",
    queryString: query,
    message: "Only read-only SPARQL query operations are allowed",
  });

const serviceEffect: Effect.Effect<
  SparqlGeneratorShape,
  never,
  LanguageModel.LanguageModel | FallbackLanguageModel | SparqlParser
> = Effect.gen(function* () {
  const parser = yield* SparqlParser;
  const model = yield* LanguageModel.LanguageModel;
  const fallback = yield* FallbackLanguageModel;

  const generateReadOnlyQuery = (
    question: string,
    schemaContext: string
  ): Effect.Effect<SparqlGenerationResult, SparqlGenerationError | SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
    Effect.gen(function* () {
      const errors = A.empty<string>();

      for (let attempt = 1; attempt <= MAX_PARSE_RETRIES; attempt++) {
        const userPrompt = buildSparqlGenerationUserPrompt({
          question,
          schemaContext,
          attempt,
          feedback: errors,
        });

        const response = yield* withLlmResilienceWithFallback(
          model,
          fallback,
          (llm) =>
            llm.generateText({
              prompt: Prompt.make([
                Prompt.systemMessage({ content: SPARQL_GENERATION_SYSTEM_PROMPT }),
                Prompt.userMessage({ content: A.make(Prompt.textPart({ text: userPrompt })) }),
              ]),
            }),
          {
            stage: "grounding",
            estimatedTokens: Str.length(userPrompt),
            maxRetries: 1,
          }
        ).pipe(
          Effect.mapError(
            (cause) =>
              new SparqlGenerationError({
                question,
                message: `Failed to generate SPARQL on attempt ${attempt}: ${String(cause)}`,
                attempts: attempt,
              })
          )
        );

        const candidate = extractQueryText(response.text);
        if (WRITE_OPERATION_PATTERN.test(candidate)) {
          errors.push("Generated query contained a write/update keyword.");
          continue;
        }

        const parsed = yield* parser.parse(candidate).pipe(
          Effect.asSome,
          Effect.catchTags({
            SparqlSyntaxError: (err) => {
              errors.push(`Syntax error: ${err.message}`);
              return Effect.succeed(O.none());
            },
            SparqlUnsupportedFeatureError: (err) => {
              errors.push(`Unsupported feature: ${err.message}`);
              return Effect.succeed(O.none());
            },
          })
        );

        if (O.isNone(parsed)) {
          continue;
        }

        if (WRITE_OPERATION_PATTERN.test(parsed.value.query.queryString)) {
          return yield* failWriteOperation(parsed.value.query.queryString);
        }

        yield* Match.value(parsed.value.query.queryType).pipe(
          Match.when("SELECT", () => Effect.void),
          Match.when("ASK", () => Effect.void),
          Match.when("CONSTRUCT", () => Effect.void),
          Match.when("DESCRIBE", () => Effect.void),
          Match.orElse(() => Effect.fail(failWriteOperation(parsed.value.query.queryString)))
        );

        return {
          query: parsed.value.query.queryString,
          attempts: attempt,
        };
      }

      return yield* new SparqlGenerationError({
        question,
        message: `Failed to generate parsable read-only SPARQL after ${MAX_PARSE_RETRIES} attempts`,
        attempts: MAX_PARSE_RETRIES,
      });
    }).pipe(
      Effect.withSpan("SparqlGenerator.generateReadOnlyQuery", {
        attributes: { questionLength: Str.length(question) },
      })
    );

  return SparqlGenerator.of({ generateReadOnlyQuery });
});

export const SparqlGeneratorLive = Layer.effect(SparqlGenerator, serviceEffect).pipe(Layer.provide(SparqlParserLive));
