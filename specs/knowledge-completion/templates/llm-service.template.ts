/**
 * LLM Service Template
 *
 * This template demonstrates the @effect/ai integration pattern
 * for services that use language models.
 *
 * VERIFIED: Phase 3 - Patterns match actual @effect/ai v0.33 API
 * Reference: tmp/effect-ontology/packages/@core-v2/test/Service/OntologyAgent.test.ts
 *
 * STATUS: TEMPLATE - Copy and adapt for your service
 */

import { LanguageModel, Prompt } from "@effect/ai"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

// =============================================================================
// Schema Definitions
// =============================================================================

/**
 * Define your output schema using Effect Schema
 *
 * IMPORTANT: Schema must extend Record<string, unknown> for generateObject
 */
const ExtractionResult = S.Struct({
  entities: S.Array(
    S.Struct({
      name: S.String,
      type: S.String,
      confidence: S.Number,
    })
  ),
  relations: S.Array(
    S.Struct({
      source: S.String,
      target: S.String,
      type: S.String,
    })
  ),
})

type ExtractionResult = S.Schema.Type<typeof ExtractionResult>

// =============================================================================
// Prompt Templates
// =============================================================================

/**
 * System prompt for extraction context
 */
const SYSTEM_PROMPT = `You are an expert knowledge extraction system.
Your task is to extract structured knowledge from text.

Key principles:
1. Be precise with entity identification
2. Assign realistic confidence scores
3. Prefer explicit statements over inferences
4. Always respond with valid JSON matching the schema.`

/**
 * Build user prompt for extraction
 */
const buildUserPrompt = (text: string): string => `
Extract entities and relations from the following text.

Text:
"""
${text}
"""

Return a JSON object with entities and relations arrays.
`

// =============================================================================
// Service Definition
// =============================================================================

/**
 * Example service using @effect/ai LanguageModel
 *
 * Key patterns:
 * 1. Inject LanguageModel.LanguageModel (note the double LanguageModel)
 * 2. Use Prompt.make() with array of messages for system prompts
 * 3. Call model.generateObject({ prompt, schema })
 * 4. Access response.value for the parsed output
 */
export class ExampleExtractor extends Effect.Service<ExampleExtractor>()(
  "@beep/knowledge-server/ExampleExtractor",
  {
    accessors: true,

    effect: Effect.gen(function* () {
      // CRITICAL: Use LanguageModel.LanguageModel for the service tag
      const model = yield* LanguageModel.LanguageModel

      return {
        /**
         * Extract structured data using LLM (simple string prompt)
         */
        extractSimple: (text: string) =>
          Effect.gen(function* () {
            // Simple string prompt (no system message)
            const response = yield* model.generateObject({
              prompt: `Extract entities from: ${text}`,
              schema: ExtractionResult,
            })

            return response.value
          }),

        /**
         * Extract structured data with system prompt (RECOMMENDED PATTERN)
         *
         * This is the correct pattern for migrating generateObjectWithSystem.
         * Use Prompt.make() with array of MessageEncoded objects.
         *
         * CRITICAL: Use `as const` for role literals to satisfy type checker.
         */
        extract: (text: string) =>
          Effect.gen(function* () {
            // Create prompt with system and user messages
            // Note: `as const` is required for role literal types
            const prompt = Prompt.make([
              { role: "system" as const, content: SYSTEM_PROMPT },
              { role: "user" as const, content: buildUserPrompt(text) },
            ])

            // Call generateObject with options object
            const response = yield* model.generateObject({
              prompt,
              schema: ExtractionResult,
              objectName: "ExtractionResult",
            })

            // Log metadata from response
            yield* Effect.logDebug("LLM call completed", {
              responseLength: response.text.length,
            })

            return response.value
          }),

        /**
         * Extract with custom objectName
         *
         * objectName provides additional guidance to the model about
         * what kind of object to generate.
         */
        extractWithName: (text: string, objectName: string) =>
          Effect.gen(function* () {
            const prompt = Prompt.make([
              { role: "system" as const, content: SYSTEM_PROMPT },
              { role: "user" as const, content: buildUserPrompt(text) },
            ])

            const response = yield* model.generateObject({
              prompt,
              schema: ExtractionResult,
              objectName, // Custom name for schema guidance
            })

            return response.value
          }),

        /**
         * Extract with error handling
         */
        extractSafe: (text: string) =>
          Effect.gen(function* () {
            const prompt = Prompt.make([
              { role: "system" as const, content: SYSTEM_PROMPT },
              { role: "user" as const, content: buildUserPrompt(text) },
            ])

            return yield* model
              .generateObject({
                prompt,
                schema: ExtractionResult,
              })
              .pipe(
                Effect.map((response) => response.value),
                Effect.catchAll((error) =>
                  Effect.succeed({
                    entities: [],
                    relations: [],
                    _error: String(error),
                  } as ExtractionResult & { _error?: string })
                )
              )
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
 * by the runtime (LlmLive from Runtime/LlmLayers.ts)
 */
export const ExampleExtractorLive = ExampleExtractor.Default

// =============================================================================
// Usage Examples
// =============================================================================

/**
 * Usage in application code:
 *
 * ```typescript
 * import { ExampleExtractor } from "./ExampleExtractor"
 * import { LlmLive } from "../Runtime/LlmLayers"
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
 *   Effect.provide(LlmLive),
 *   Effect.runPromise
 * )
 * ```
 *
 * Usage in tests:
 *
 * ```typescript
 * import { effect, strictEqual } from "@beep/testkit"
 * import { MockLlmLive, setMockResponse } from "../test/_shared/TestLayers"
 *
 * effect("extracts entities", () =>
 *   Effect.gen(function* () {
 *     setMockResponse("ExtractionResult", {
 *       entities: [{ name: "John", type: "Person", confidence: 0.9 }],
 *       relations: []
 *     })
 *
 *     const extractor = yield* ExampleExtractor
 *     const result = yield* extractor.extract("John works at Acme")
 *
 *     strictEqual(result.entities.length, 1)
 *   }).pipe(
 *     Effect.provide(ExampleExtractorLive),
 *     Effect.provide(MockLlmLive)
 *   )
 * )
 * ```
 */

// =============================================================================
// Migration from AiService Pattern
// =============================================================================

/**
 * BEFORE (current AiService pattern):
 *
 * ```typescript
 * const ai = yield* AiService
 * const result = yield* ai.generateObjectWithSystem(
 *   EntityOutput,           // schema
 *   buildSystemPrompt(),    // system prompt
 *   buildEntityPrompt(...), // user prompt
 *   config.aiConfig         // config
 * )
 * const entities = result.data.entities
 * const tokens = result.usage.totalTokens
 * ```
 *
 * AFTER (@effect/ai pattern):
 *
 * ```typescript
 * const model = yield* LanguageModel.LanguageModel  // Note: double LanguageModel
 * const prompt = Prompt.make([
 *   { role: "system" as const, content: buildSystemPrompt() },
 *   { role: "user" as const, content: buildEntityPrompt(...) }
 * ])
 * const response = yield* model.generateObject({
 *   prompt,
 *   schema: EntityOutput,
 *   objectName: "EntityOutput"
 * })
 * const entities = response.value.entities
 * ```
 *
 * Key differences:
 * - Service: AiService → LanguageModel.LanguageModel (double LanguageModel)
 * - System prompt: Separate param → Prompt.make([{role: "system", ...}])
 * - Method signature: Positional args → Options object
 * - Schema position: First arg → Inside options object
 * - Result access: result.data → response.value
 * - Role literals: Must use `as const` for TypeScript
 */
