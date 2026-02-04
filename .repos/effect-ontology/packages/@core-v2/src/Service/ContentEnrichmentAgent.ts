/**
 * Service: Content Enrichment Agent
 *
 * Uses LLM to extract structured metadata from fetched content.
 * Analyzes markdown content to identify:
 * - Headlines, descriptions, and publication dates
 * - Source type classification (news, blog, press release, etc.)
 * - Key named entities and topics
 * - Author and organization attribution
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   const enricher = yield* ContentEnrichmentAgent
 *   const jinaContent = yield* JinaReaderClient.fetchUrl("https://example.com/article")
 *   const enriched = yield* enricher.enrich(jinaContent.content)
 *   console.log(enriched.headline, enriched.topics)
 * })
 * ```
 *
 * @since 2.0.0
 * @module Service/ContentEnrichmentAgent
 */

import { LanguageModel } from "@effect/ai"
import { Data, Effect, JSONSchema, Schema } from "effect"
import type { JinaContent } from "../Domain/Model/EnrichedContent.js"
import { EnrichedContent } from "../Domain/Model/EnrichedContent.js"
import { ConfigService } from "./Config.js"
import { generateObjectWithRetry } from "./LlmWithRetry.js"

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error: Failed to enrich content
 *
 * @since 2.0.0
 * @category Errors
 */
export class ContentEnrichmentError extends Data.TaggedError("ContentEnrichmentError")<{
  readonly message: string
  readonly url?: string
  readonly cause?: unknown
}> {}

// =============================================================================
// Enrichment Schema (for LLM output)
// =============================================================================

/**
 * Schema for LLM output - matches EnrichedContent structure
 */
const EnrichmentOutputSchema = Schema.Struct({
  headline: Schema.String.annotations({
    description: "Main headline or title summarizing the content"
  }),
  description: Schema.String.annotations({
    description: "1-2 sentence summary of the content's main points"
  }),
  sourceType: Schema.Literal("news", "blog", "press_release", "official", "academic", "unknown").annotations({
    description: "Classification of the content source type"
  }),
  publishedAt: Schema.NullOr(Schema.String).annotations({
    description: "Publication date in ISO 8601 format (YYYY-MM-DD) if identifiable, null otherwise"
  }),
  author: Schema.NullOr(Schema.String).annotations({
    description: "Author name if identifiable, null otherwise"
  }),
  organization: Schema.NullOr(Schema.String).annotations({
    description: "Publishing organization (news outlet, company, institution) if identifiable"
  }),
  keyEntities: Schema.Array(Schema.String).annotations({
    description: "Named entities (people, organizations, locations) prominently mentioned"
  }),
  topics: Schema.Array(Schema.String).annotations({
    description: "Topic or category tags for the content"
  }),
  language: Schema.String.annotations({
    description: "ISO 639-1 language code (e.g., 'en', 'es', 'de')"
  }),
  wordCount: Schema.Number.annotations({
    description: "Approximate word count of the content"
  })
})

type EnrichmentOutput = Schema.Schema.Type<typeof EnrichmentOutputSchema>

// =============================================================================
// Prompt Construction
// =============================================================================

const ENRICHMENT_SYSTEM_PROMPT =
  `You are a content analysis expert. Your task is to extract structured metadata from markdown content.

Analyze the content and extract:
1. **Headline**: The main title or a generated summary headline if none exists
2. **Description**: A concise 1-2 sentence summary of the main points
3. **Source Type**: Classify as one of: news, blog, press_release, official, academic, unknown
4. **Published Date**: Extract if mentioned, use ISO 8601 format (YYYY-MM-DD), or null if not found
5. **Author**: Extract author name if attributed, or null
6. **Organization**: Identify the publishing organization (news outlet, company, agency), or null
7. **Key Entities**: List prominent named entities (people, organizations, places)
8. **Topics**: Generate 3-5 topic/category tags
9. **Language**: Detect the primary language (ISO 639-1 code)
10. **Word Count**: Estimate the word count

Be accurate and conservative - use null for uncertain fields rather than guessing.`

const buildEnrichmentPrompt = (content: string, url?: string): string => {
  const urlContext = url ? `\nSource URL: ${url}\n` : ""
  const truncatedContent = content.length > 8000 ? content.slice(0, 8000) + "\n\n[Content truncated...]" : content

  return `${urlContext}
Content to analyze:

${truncatedContent}`
}

// =============================================================================
// Service
// =============================================================================

export class ContentEnrichmentAgent extends Effect.Service<ContentEnrichmentAgent>()(
  "ContentEnrichmentAgent",
  {
    effect: Effect.gen(function*() {
      const llm = yield* LanguageModel.LanguageModel
      const config = yield* ConfigService

      const { model, provider, timeoutMs } = config.llm
      const retryConfig = {
        initialDelayMs: config.runtime.retryInitialDelayMs,
        maxDelayMs: config.runtime.retryMaxDelayMs,
        maxAttempts: config.runtime.retryMaxAttempts,
        timeoutMs
      }

      /**
       * Enrich content from JinaContent response
       */
      const enrichFromJina = (
        jinaContent: JinaContent
      ): Effect.Effect<EnrichedContent, ContentEnrichmentError> =>
        enrich(jinaContent.content, jinaContent.url).pipe(
          Effect.map((enriched) =>
            // Use Jina's extracted metadata as fallback
            new EnrichedContent({
              ...enriched,
              // Prefer Jina's title if we didn't extract a good headline
              headline: enriched.headline || jinaContent.title,
              // Use Jina's description as fallback
              description: enriched.description || jinaContent.description || "",
              // Use Jina's published date if we didn't find one
              publishedAt: enriched.publishedAt || parseDate(jinaContent.publishedDate),
              // Use Jina's site name as organization fallback
              organization: enriched.organization || jinaContent.siteName || null
            })
          )
        )

      /**
       * Enrich raw markdown content
       */
      const enrich = (
        content: string,
        url?: string
      ): Effect.Effect<EnrichedContent, ContentEnrichmentError> =>
        Effect.gen(function*() {
          // Calculate word count from content
          const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length

          const prompt = {
            systemMessage: ENRICHMENT_SYSTEM_PROMPT,
            userMessage: buildEnrichmentPrompt(content, url)
          }

          const response = yield* generateObjectWithRetry({
            llm,
            prompt,
            schema: EnrichmentOutputSchema,
            objectName: "enrichedContent",
            serviceName: "ContentEnrichment",
            model,
            provider,
            retryConfig,
            spanAttributes: {
              "content.url": url ?? "unknown",
              "content.wordCount": wordCount
            }
          }).pipe(
            Effect.mapError((error) =>
              new ContentEnrichmentError({
                message: `Failed to enrich content: ${error}`,
                url,
                cause: error
              })
            )
          )

          // Convert LLM output to EnrichedContent
          const output = response.value as EnrichmentOutput

          return new EnrichedContent({
            headline: output.headline,
            description: output.description,
            sourceType: output.sourceType,
            publishedAt: parseDate(output.publishedAt),
            author: output.author,
            organization: output.organization,
            keyEntities: output.keyEntities,
            topics: output.topics,
            language: output.language || "en",
            wordCount: output.wordCount || wordCount
          })
        })

      /**
       * Get the JSON schema for enrichment output (useful for structured extraction)
       */
      const getSchema = (): object => JSONSchema.make(EnrichmentOutputSchema)

      return {
        enrich,
        enrichFromJina,
        getSchema
      }
    }),
    accessors: true
  }
) {}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Parse date string to Date or null
 */
const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}
