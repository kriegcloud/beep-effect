import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel } from "@effect/ai";
import * as Prompt from "@effect/ai/Prompt";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { withLlmResilience } from "../LlmControl/LlmResilience";

const $I = $KnowledgeServerId.create("Service/ContentEnrichmentAgent");

const MAX_CONTENT_SIZE = 8_000;

export const EnrichedContent = S.Struct({
  headline: S.String,
  description: S.String,
  sourceType: S.Literal("news", "blog", "press_release", "official", "academic", "unknown"),
  publishedAt: S.optional(S.String),
  author: S.optional(S.String),
  organization: S.optional(S.String),
  keyEntities: S.Array(S.String),
  topics: S.Array(S.String),
  language: S.String,
  wordCount: S.NonNegativeInt,
});

export type EnrichedContent = S.Schema.Type<typeof EnrichedContent>;

export class ContentEnrichmentError extends S.TaggedError<ContentEnrichmentError>()("ContentEnrichmentError", {
  message: S.String,
  url: S.optional(S.String),
  cause: S.optional(S.Defect),
}) {}

const ENRICHMENT_SYSTEM_PROMPT =
  "You are a content analysis expert. Extract structured metadata from markdown/text content. Be accurate and conservative; if uncertain, omit fields or use an empty list.";

const buildUserPrompt = (content: string, url?: string): string => {
  const truncated = Str.length(content) > MAX_CONTENT_SIZE ? `${Str.slice(0, MAX_CONTENT_SIZE)(content)}\n\n[truncated]` : content;
  const urlCtx = url ? `Source URL: ${url}\n\n` : "";
  return `${urlCtx}Content:\n\n${truncated}`;
};

const estimateWordCount = (content: string): number => {
  const trimmed = Str.trim(content);
  if (Str.isEmpty(trimmed)) return 0;
  return A.length(trimmed.split(/\s+/g));
};

export interface ContentEnrichmentAgentShape {
  readonly enrich: (content: string, url?: string) => Effect.Effect<EnrichedContent, ContentEnrichmentError>;
}

export class ContentEnrichmentAgent extends Context.Tag($I`ContentEnrichmentAgent`)<
  ContentEnrichmentAgent,
  ContentEnrichmentAgentShape
>() {}

const serviceEffect: Effect.Effect<ContentEnrichmentAgentShape, never, LanguageModel.LanguageModel> = Effect.gen(
  function* () {
    const model = yield* LanguageModel.LanguageModel;

    const enrich: ContentEnrichmentAgentShape["enrich"] = (content, url) =>
      Effect.gen(function* () {
        const wordCount = estimateWordCount(content);
        const userPrompt = buildUserPrompt(content, url);

        const result = yield* withLlmResilience(
          model.generateObject({
            prompt: Prompt.make([
              Prompt.systemMessage({ content: ENRICHMENT_SYSTEM_PROMPT }),
              Prompt.userMessage({ content: A.make(Prompt.textPart({ text: userPrompt })) }),
            ]),
            schema: EnrichedContent,
            objectName: "EnrichedContent",
          }),
          {
            stage: "grounding",
            estimatedTokens: Str.length(userPrompt),
            maxRetries: 1,
          }
        ).pipe(
          Effect.mapError(
            (cause) =>
              new ContentEnrichmentError({
                message: `Content enrichment failed: ${String(cause)}`,
                url,
                cause: cause as unknown,
              })
          )
        );

        // Ensure wordCount is at least consistent with the input estimate when model returns 0.
        const enriched = result.value;
        return {
          ...enriched,
          wordCount: enriched.wordCount > 0 ? enriched.wordCount : wordCount,
          language: Str.isEmpty(enriched.language) ? "en" : enriched.language,
        };
      }).pipe(
        Effect.withSpan("ContentEnrichmentAgent.enrich", {
          captureStackTrace: false,
          attributes: {
            url: url ?? "unknown",
            contentLength: Str.length(content),
          },
        })
      );

    return ContentEnrichmentAgent.of({ enrich });
  }
);

export const ContentEnrichmentAgentLive = Layer.effect(ContentEnrichmentAgent, serviceEffect);

