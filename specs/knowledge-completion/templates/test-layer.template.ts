/**
 * Test Layer Template
 *
 * This template demonstrates how to create mock Layers
 * for testing services that depend on @effect/ai LanguageModel.
 *
 * VERIFIED: Phase 3 - Patterns match actual @effect/ai v0.33 API
 * Reference: tmp/effect-ontology/packages/@core-v2/test/Service/OntologyAgent.test.ts
 *
 * STATUS: TEMPLATE - Copy and adapt for your test setup
 *
 * NOTE: Due to @effect/ai's complex type signatures, these mocks use
 * type assertions (`as unknown as LanguageModel.Service`). This is the
 * standard pattern from the reference implementation.
 */

import { LanguageModel } from "@effect/ai"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

// =============================================================================
// Mock Response Registry
// =============================================================================

/**
 * Registry for mock responses keyed by prompt content or objectName
 *
 * This allows tests to set up specific responses for different calls.
 */
const mockResponses = new Map<string, unknown>()

/**
 * Set a mock response for a specific key (objectName or schema identifier)
 *
 * @example
 * ```typescript
 * setMockResponse("ExtractionResult", {
 *   entities: [{ name: "Test", type: "Person", confidence: 0.9 }],
 *   relations: []
 * })
 * ```
 */
export const setMockResponse = (key: string, response: unknown): void => {
  mockResponses.set(key, response)
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
 * Create a mock LanguageModel service
 *
 * CRITICAL PATTERN: The reference implementation uses:
 * - `Layer.succeed(LanguageModel.LanguageModel, { ... } as unknown as LanguageModel.Service)`
 *
 * The `as unknown as LanguageModel.Service` cast is necessary because @effect/ai
 * has complex generic signatures that are difficult to satisfy exactly.
 */
const createMockLanguageModel = () => ({
  /**
   * Mock generateObject implementation
   *
   * Returns predefined response from mockResponses registry,
   * or empty object with mock metadata.
   */
  generateObject: (options: { prompt: unknown; schema: unknown; objectName?: string }) =>
    Effect.succeed({
      value: options.objectName && mockResponses.has(options.objectName)
        ? mockResponses.get(options.objectName)
        : mockResponses.size > 0
          ? mockResponses.values().next().value
          : {},
      // GenerateTextResponse fields
      content: [],
      text: "",
      reasoning: null,
      reasoningText: "",
      toolCalls: [],
      toolCallResults: [],
      finishReason: "stop",
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    } as unknown),

  /**
   * Mock generateText implementation
   */
  generateText: () =>
    Effect.succeed({
      text: "Mock generated text",
      content: [],
      reasoning: null,
      reasoningText: "",
      toolCalls: [],
      toolCallResults: [],
      finishReason: "stop",
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    } as unknown),

  /**
   * Mock streamText implementation
   */
  streamText: () =>
    Effect.succeed({
      stream: Effect.succeed([]),
    } as unknown),
})

// =============================================================================
// Mock Layer
// =============================================================================

/**
 * MockLlmLive - Test Layer for LanguageModel
 *
 * Use this Layer in tests to avoid real LLM API calls.
 *
 * CRITICAL PATTERN from reference implementation:
 * ```typescript
 * Layer.succeed(LanguageModel.LanguageModel, { ... } as unknown as LanguageModel.Service)
 * ```
 *
 * @example
 * ```typescript
 * import { effect, strictEqual } from "@beep/testkit"
 * import { MockLlmLive, setMockResponse, clearMockResponses } from "../_shared/TestLayers"
 *
 * effect("extracts entities", () =>
 *   Effect.gen(function* () {
 *     // Set up mock response BEFORE running the effect
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
 * ```
 */
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  createMockLanguageModel() as unknown as LanguageModel.Service
)

// =============================================================================
// Parameterized Mock Factories
// =============================================================================

/**
 * Create a custom mock Layer with specific fixed response
 *
 * Use this for tests that need a specific response regardless of input.
 *
 * @example
 * ```typescript
 * const CustomMock = createMockLlmWithResponse({
 *   entities: [{ name: "Alice", type: "Person", confidence: 0.8 }],
 *   relations: []
 * })
 *
 * effect("test with custom response", () =>
 *   program.pipe(Effect.provide(CustomMock))
 * )
 * ```
 */
export const createMockLlmWithResponse = <A>(response: A) =>
  Layer.succeed(
    LanguageModel.LanguageModel,
    {
      generateObject: () =>
        Effect.succeed({
          value: response,
          content: [],
          text: "",
          reasoning: null,
          reasoningText: "",
          toolCalls: [],
          toolCallResults: [],
          finishReason: "stop",
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
        } as unknown),
      generateText: () =>
        Effect.succeed({
          text: "",
          content: [],
          reasoning: null,
          reasoningText: "",
          toolCalls: [],
          toolCallResults: [],
          finishReason: "stop",
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        } as unknown),
      streamText: () =>
        Effect.succeed({
          stream: Effect.succeed([]),
        } as unknown),
    } as unknown as LanguageModel.Service
  )

/**
 * Create a failing mock Layer for error testing
 *
 * Use this to test error handling paths.
 *
 * @example
 * ```typescript
 * import * as Either from "effect/Either"
 *
 * const FailingLlm = createFailingMockLlm(new Error("API timeout"))
 *
 * effect("handles LLM failure", () =>
 *   Effect.gen(function* () {
 *     const extractor = yield* ExampleExtractor
 *     const result = yield* extractor.extract("test").pipe(Effect.either)
 *
 *     strictEqual(Either.isLeft(result), true)
 *   }).pipe(
 *     Effect.provide(ExampleExtractor.Default),
 *     Effect.provide(FailingLlm)
 *   )
 * )
 * ```
 */
export const createFailingMockLlm = (error: Error) =>
  Layer.succeed(
    LanguageModel.LanguageModel,
    {
      generateObject: () => Effect.fail(error),
      generateText: () => Effect.fail(error),
      streamText: () => Effect.fail(error),
    } as unknown as LanguageModel.Service
  )

/**
 * Create a mock that tracks calls for verification
 *
 * Use this to verify that the LLM was called with expected parameters.
 *
 * @example
 * ```typescript
 * const { layer, getCalls } = createTrackingMockLlm({
 *   entities: [],
 *   relations: []
 * })
 *
 * effect("tracks LLM calls", () =>
 *   Effect.gen(function* () {
 *     const extractor = yield* ExampleExtractor
 *     yield* extractor.extract("Test input")
 *
 *     const calls = getCalls()
 *     strictEqual(calls.length, 1)
 *   }).pipe(
 *     Effect.provide(ExampleExtractor.Default),
 *     Effect.provide(layer)
 *   )
 * )
 * ```
 */
export const createTrackingMockLlm = <A>(response: A) => {
  const calls: Array<{ options: unknown }> = []

  const layer = Layer.succeed(
    LanguageModel.LanguageModel,
    {
      generateObject: (options: unknown) => {
        calls.push({ options })
        return Effect.succeed({
          value: response,
          content: [],
          text: "",
          reasoning: null,
          reasoningText: "",
          toolCalls: [],
          toolCallResults: [],
          finishReason: "stop",
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
        } as unknown)
      },
      generateText: (options: unknown) => {
        calls.push({ options })
        return Effect.succeed({
          text: "",
          content: [],
          reasoning: null,
          reasoningText: "",
          toolCalls: [],
          toolCallResults: [],
          finishReason: "stop",
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        } as unknown)
      },
      streamText: () =>
        Effect.succeed({
          stream: Effect.succeed([]),
        } as unknown),
    } as unknown as LanguageModel.Service
  )

  return {
    layer,
    getCalls: () => [...calls],
    clearCalls: () => {
      calls.length = 0
    },
  }
}

// =============================================================================
// Composite Test Layers
// =============================================================================

/**
 * Full test Layer combining MockLlm with other test dependencies
 *
 * Extend this pattern for services with multiple dependencies.
 *
 * @example
 * ```typescript
 * // In test/_shared/TestLayers.ts
 * export const TestKnowledgeLive = Layer.mergeAll(
 *   MockLlmLive,
 *   MockEmbeddingLive,
 *   MockOntologyLive,
 * )
 *
 * // In test file
 * layer(TestKnowledgeLive)("ExtractionPipeline", (it) => {
 *   it.effect("runs full pipeline", () => ...)
 * })
 * ```
 */
export const TestKnowledgeLive = Layer.mergeAll(
  MockLlmLive
  // Add other mock layers as needed:
  // MockEmbeddingLive,
  // MockOntologyLive,
)

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Helper to set up mock responses before a test
 *
 * Clears previous responses and sets new ones.
 *
 * @example
 * ```typescript
 * effect("test with setup", () =>
 *   Effect.gen(function* () {
 *     setupMockResponses({
 *       MentionOutput: { mentions: [{ text: "John", startChar: 0, endChar: 4 }] },
 *       EntityOutput: { entities: [{ name: "John", type: "Person" }] }
 *     })
 *
 *     // Run test...
 *   })
 * )
 * ```
 */
export const setupMockResponses = (
  responses: Record<string, unknown>
): void => {
  clearMockResponses()
  for (const [key, value] of Object.entries(responses)) {
    setMockResponse(key, value)
  }
}

// =============================================================================
// Usage Notes
// =============================================================================

/**
 * RECOMMENDED TEST PATTERNS:
 *
 * 1. Simple response mock (by objectName):
 *    ```typescript
 *    setMockResponse("EntityOutput", expectedResponse)
 *    // model.generateObject({ prompt, schema, objectName: "EntityOutput" })
 *    // returns expectedResponse
 *    ```
 *
 * 2. Fixed response for entire test:
 *    ```typescript
 *    Effect.provide(createMockLlmWithResponse(fixedResponse))
 *    ```
 *
 * 3. Error testing:
 *    ```typescript
 *    Effect.provide(createFailingMockLlm(new Error("...")))
 *    ```
 *
 * 4. Call verification:
 *    ```typescript
 *    const { layer, getCalls } = createTrackingMockLlm(response)
 *    // ... run test
 *    const calls = getCalls()
 *    strictEqual(calls.length, expected)
 *    ```
 *
 * CLEANUP: Always call clearMockResponses() in beforeEach or use
 * setupMockResponses() which clears automatically.
 *
 * TYPE ASSERTIONS: The `as unknown as LanguageModel.Service` casts are
 * the standard pattern from the reference implementation. This is necessary
 * because @effect/ai uses complex generic signatures.
 */
