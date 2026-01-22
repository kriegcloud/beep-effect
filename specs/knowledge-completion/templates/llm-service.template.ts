/**
 * LLM Service Template
 *
 * This template demonstrates the @effect/ai integration pattern
 * for services that use language models.
 *
 * STATUS: TEMPLATE - DO NOT IMPORT DIRECTLY
 * This file will be verified during Phase 3.
 */

import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import { LanguageModel, Prompt } from "@effect/ai"

// =============================================================================
// Schema Definitions
// =============================================================================

/**
 * Define your output schema using Effect Schema
 */
const ExtractionResult = S.Struct({
  entities: S.Array(S.Struct({
    name: S.String,
    type: S.String,
    confidence: S.Number,
  })),
  relations: S.Array(S.Struct({
    source: S.String,
    target: S.String,
    type: S.String,
  })),
})

type ExtractionResult = S.Schema.Type<typeof ExtractionResult>

// =============================================================================
// Service Definition
// =============================================================================

/**
 * Example service using @effect/ai LanguageModel
 *
 * Key patterns:
 * 1. Inject LanguageModel.LanguageModel service
 * 2. Use Prompt.make() for type-safe prompts
 * 3. Call llm.generateObject() with schema
 * 4. Handle errors with Effect.catchTag
 */
export class ExampleExtractor extends Effect.Service<ExampleExtractor>()(
  "@beep/knowledge-server/ExampleExtractor",
  {
    accessors: true,

    effect: Effect.gen(function* () {
      // Inject the LanguageModel service
      const llm = yield* LanguageModel.LanguageModel

      return {
        /**
         * Extract structured data using LLM
         */
        extract: (text: string) =>
          Effect.gen(function* () {
            // Create a type-safe prompt
            const prompt = Prompt.make(`
              Extract entities and relations from the following text.

              Text:
              ${text}

              Return structured JSON matching the schema.
            `)

            // Call generateObject with schema
            const result = yield* llm.generateObject({
              prompt,
              schema: ExtractionResult,
              objectName: "ExtractionResult",
            })

            return result.value
          }),

        /**
         * Example with system prompt (if supported)
         *
         * NOTE: Verify @effect/ai system prompt support during P1 research.
         * This may need adjustment based on actual API.
         */
        extractWithContext: (text: string, context: string) =>
          Effect.gen(function* () {
            // Option A: If Prompt supports system messages
            const prompt = Prompt.make({
              system: `You are an expert entity extractor. Context: ${context}`,
              user: `Extract entities from: ${text}`,
            })

            // Option B: If system prompt is embedded in user prompt
            // const prompt = Prompt.make(`
            //   [SYSTEM] You are an expert entity extractor. Context: ${context}
            //   [USER] Extract entities from: ${text}
            // `)

            const result = yield* llm.generateObject({
              prompt,
              schema: ExtractionResult,
              objectName: "ExtractionResult",
            })

            return result.value
          }),
      }
    }),
  }
) {}

// =============================================================================
// Layer Composition
// =============================================================================

/**
 * Example Layer composition for the service
 *
 * The LanguageModel.LanguageModel dependency will be provided
 * by the runtime (AnthropicLive or OpenAiLive from LlmLayers.ts)
 */
export const ExampleExtractorLive = ExampleExtractor.Default

// =============================================================================
// Usage Example
// =============================================================================

/**
 * Usage in application code:
 *
 * ```typescript
 * import { ExampleExtractor } from "./ExampleExtractor"
 * import { AnthropicLive } from "../Runtime/LlmLayers"
 *
 * const program = Effect.gen(function* () {
 *   const extractor = yield* ExampleExtractor
 *   const result = yield* extractor.extract("John works at Acme Corp.")
 *   console.log(result.entities)
 * })
 *
 * // Run with provider
 * program.pipe(
 *   Effect.provide(ExampleExtractorLive),
 *   Effect.provide(AnthropicLive),
 *   Effect.runPromise
 * )
 * ```
 */
