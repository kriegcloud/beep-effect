import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { LanguageModel, Prompt } from "@effect/ai";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import type * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FallbackLanguageModel } from "@beep/knowledge-server/LlmControl/FallbackLanguageModel";
import { withLlmResilienceWithFallback } from "@beep/knowledge-server/LlmControl/LlmResilience";

const $I = $KnowledgeServerId.create("Service/ContentEnrichmentAgent");

export class SourceChannel extends BS.StringLiteralKit("email", "calendar", "crm", "documents", "web", "unknown") {}
export declare namespace SourceChannel {
  export type Type = typeof SourceChannel.Type;
}

// Kept for effect-ontology parity when enriching web content, but not forced for non-web sources.
export class WebSourceType extends BS.StringLiteralKit(
  "news",
  "blog",
  "press_release",
  "official",
  "academic",
  "unknown"
) {}
export declare namespace WebSourceType {
  export type Type = typeof WebSourceType.Type;
}

export class ContentEnrichmentError extends S.TaggedError<ContentEnrichmentError>($I`ContentEnrichmentError`)(
  "ContentEnrichmentError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ContentEnrichmentError", { description: "Failed to enrich content via LLM" })
) {}

export class EnrichedContent extends S.Class<EnrichedContent>($I`EnrichedContent`)({
  headline: S.String,
  description: S.String,
  sourceChannel: S.optionalWith(SourceChannel, { default: () => "unknown" }),
  webSourceType: S.optionalWith(S.OptionFromNullishOr(WebSourceType, null), { default: O.none<WebSourceType.Type> }),
  publishedAt: S.optionalWith(S.OptionFromNullishOr(BS.DateTimeUtcFromAllAcceptable, null), {
    default: O.none<DateTime.Utc>,
  }),
  author: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  organization: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  keyEntities: S.Array(S.String),
  topics: S.Array(S.String),
  language: S.optionalWith(S.String, { default: () => "en" }),
  wordCount: S.optionalWith(S.NonNegativeInt, { default: () => 0 }),
}) {}

const ENRICHMENT_SYSTEM_PROMPT = `You are a content analysis expert. Extract structured metadata from the provided content.

Return:
1. headline: main title (or a conservative generated headline if none)
2. description: 1-2 sentence summary
3. sourceChannel: one of email, calendar, crm, documents, web, unknown
4. webSourceType: if sourceChannel=web, classify as one of news, blog, press_release, official, academic, unknown (otherwise null)
5. publishedAt: ISO 8601 timestamp if identifiable, otherwise null
6. author: author name if identifiable, otherwise null
7. organization: publishing org if identifiable, otherwise null
8. keyEntities: prominent named entities
9. topics: 3-5 topic tags
10. language: ISO 639-1 (e.g., en)
11. wordCount: approximate word count

Be conservative: use null when uncertain.`;

const buildPrompt = (content: string, url: O.Option<string>): string => {
  const truncated = content.length > 8000 ? `${content.slice(0, 8000)}\n\n[Content truncated...]` : content;
  const urlBlock = O.match(url, { onNone: () => "", onSome: (u) => `Source URL: ${u}\n\n` });
  return `${urlBlock}Content:\n\n${truncated}`;
};

const estimateWordCount = (content: string): number =>
  A.length(A.filter(Str.split(/\s+/)(content), (w) => Str.length(w) > 0));

export interface ContentEnrichmentAgentShape {
  readonly enrich: (params: {
    readonly content: string;
    readonly url?: string;
    readonly sourceChannel?: SourceChannel.Type;
  }) => Effect.Effect<EnrichedContent, ContentEnrichmentError>;
}

export class ContentEnrichmentAgent extends Context.Tag($I`ContentEnrichmentAgent`)<
  ContentEnrichmentAgent,
  ContentEnrichmentAgentShape
>() {}

const serviceEffect: Effect.Effect<
  ContentEnrichmentAgentShape,
  never,
  LanguageModel.LanguageModel | FallbackLanguageModel
> = Effect.gen(function* () {
  const model = yield* LanguageModel.LanguageModel;
  const fallback = yield* FallbackLanguageModel;

  return ContentEnrichmentAgent.of({
    enrich: ({ content, sourceChannel, url }) =>
      Effect.gen(function* () {
        const channel: SourceChannel.Type = sourceChannel ?? "unknown";
        const wordCount = estimateWordCount(content);

        const response = yield* withLlmResilienceWithFallback(
          model,
          fallback,
          (llm) =>
            llm.generateObject({
              prompt: Prompt.make([
                Prompt.systemMessage({ content: ENRICHMENT_SYSTEM_PROMPT }),
                Prompt.userMessage({
                  content: A.make(Prompt.textPart({ text: buildPrompt(content, O.fromNullable(url)) })),
                }),
              ]),
              schema: EnrichedContent,
              objectName: "EnrichedContent",
            }),
          {
            stage: "entity_extraction",
            estimatedTokens: Str.length(content),
            maxRetries: 1,
            baseRetryDelay: Duration.zero,
          }
        ).pipe(
          Effect.map((r) => r.value),
          Effect.mapError(
            (e) =>
              new ContentEnrichmentError({
                message: `Content enrichment failed: ${String(e)}`,
                cause: e,
              })
          )
        );

        return new EnrichedContent({
          ...response,
          sourceChannel: response.sourceChannel || channel,
          language: response.language || "en",
          wordCount: response.wordCount || wordCount,
        });
      }),
  });
});

export const ContentEnrichmentAgentLive = Layer.effect(ContentEnrichmentAgent, serviceEffect);
