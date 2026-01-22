/**
 * Test Layer Template
 *
 * This template demonstrates how to create mock Layers
 * for testing services that depend on @effect/ai LanguageModel.
 *
 * STATUS: TEMPLATE - DO NOT IMPORT DIRECTLY
 * This file will be verified during Phase 3.
 */

import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as S from "effect/Schema"
import { LanguageModel, Prompt } from "@effect/ai"

// =============================================================================
// Mock Response Registry
// =============================================================================

/**
 * Registry for mock responses keyed by objectName
 *
 * This allows tests to set up specific responses for different schemas.
 */
const mockResponses = new Map<string, unknown>()

/**
 * Set a mock response for a specific objectName
 *
 * @example
 * setMockResponse("ExtractionResult", {
 *   entities: [{ name: "Test", type: "Person", confidence: 0.9 }],
 *   relations: []
 * })
 */
export const setMockResponse = (objectName: string, response: unknown): void => {
  mockResponses.set(objectName, response)
}

/**
 * Clear all mock responses
 */
export const clearMockResponses = (): void => {
  mockResponses.clear()
}

// =============================================================================
// Mock LanguageModel Implementation
// =============================================================================

/**
 * Create a mock LanguageModel that returns predefined responses
 *
 * NOTE: The exact shape of LanguageModel.LanguageModel interface
 * should be verified during P1 research. This is a best-guess template.
 */
const createMockLanguageModel = () => ({
  /**
   * Mock generateObject implementation
   *
   * Returns predefined response from mockResponses registry,
   * or generates a default response based on schema.
   */
  generateObject: <A>({
    schema,
    objectName,
  }: {
    prompt: Prompt.Prompt
    schema: S.Schema<A, unknown>
    objectName: string
  }) =>
    Effect.gen(function* () {
      // Check for predefined mock response
      const mockResponse = mockResponses.get(objectName)
      if (mockResponse) {
        return {
          value: mockResponse as A,
          usage: { inputTokens: 100, outputTokens: 50 },
        }
      }

      // Generate default response from schema
      // This is a simple fallback - tests should use setMockResponse
      const defaultValue = yield* Effect.try(() =>
        generateDefaultFromSchema(schema)
      ).pipe(
        Effect.orElseSucceed(() => ({} as A))
      )

      return {
        value: defaultValue,
        usage: { inputTokens: 100, outputTokens: 50 },
      }
    }),

  /**
   * Mock generateText implementation
   */
  generateText: ({ prompt }: { prompt: Prompt.Prompt }) =>
    Effect.succeed({
      text: "Mock generated text response",
      usage: { inputTokens: 50, outputTokens: 20 },
    }),
})

/**
 * Generate a default value from a schema
 *
 * This is a simple implementation - complex schemas may need
 * explicit mock responses via setMockResponse.
 */
const generateDefaultFromSchema = <A>(schema: S.Schema<A, unknown>): A => {
  // This is a placeholder - real implementation would inspect schema AST
  // For testing, always use setMockResponse with explicit values
  return {} as A
}

// =============================================================================
// Mock Layer
// =============================================================================

/**
 * MockLlmLive - Test Layer for LanguageModel
 *
 * Use this Layer in tests to avoid real LLM API calls.
 *
 * @example
 * import { effect, strictEqual } from "@beep/testkit"
 * import { MockLlmLive, setMockResponse } from "../_shared/TestLayers"
 *
 * effect("extracts entities", () =>
 *   Effect.gen(function* () {
 *     // Set up mock response
 *     setMockResponse("ExtractionResult", {
 *       entities: [{ name: "John", type: "Person", confidence: 0.95 }],
 *       relations: []
 *     })
 *
 *     const extractor = yield* ExampleExtractor
 *     const result = yield* extractor.extract("John works at Acme")
 *
 *     strictEqual(result.entities.length, 1)
 *     strictEqual(result.entities[0].name, "John")
 *   }).pipe(
 *     Effect.provide(ExampleExtractor.Default),
 *     Effect.provide(MockLlmLive)
 *   )
 * )
 */
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  createMockLanguageModel()
)

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Create a custom mock Layer with specific behavior
 *
 * Use this for tests that need custom mock logic beyond simple responses.
 */
export const createCustomMockLlm = (
  overrides: Partial<ReturnType<typeof createMockLanguageModel>>
) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    ...createMockLanguageModel(),
    ...overrides,
  })

/**
 * Create a failing mock Layer for error testing
 *
 * @example
 * const FailingLlm = createFailingMockLlm(new Error("API timeout"))
 *
 * effect("handles LLM failure", () =>
 *   Effect.gen(function* () {
 *     const extractor = yield* ExampleExtractor
 *     const result = yield* extractor.extract("test").pipe(
 *       Effect.either
 *     )
 *     strictEqual(Either.isLeft(result), true)
 *   }).pipe(
 *     Effect.provide(ExampleExtractor.Default),
 *     Effect.provide(FailingLlm)
 *   )
 * )
 */
export const createFailingMockLlm = (error: Error) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () => Effect.fail(error),
    generateText: () => Effect.fail(error),
  })

// =============================================================================
// Composite Test Layers
// =============================================================================

/**
 * Full test Layer combining MockLlm with other test dependencies
 *
 * Extend this pattern for services with multiple dependencies.
 */
export const TestKnowledgeLayer = Layer.mergeAll(
  MockLlmLive,
  // Add other mock layers as needed:
  // MockEmbeddingLive,
  // MockOntologyLive,
)
