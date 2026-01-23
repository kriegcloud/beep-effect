/**
 * Test Layers for Knowledge Server Tests
 *
 * Provides mock implementations for testing services that depend on
 * @effect/ai LanguageModel and other external dependencies.
 *
 * @module knowledge-server/test/_shared/TestLayers
 * @since 0.1.0
 */
import { LanguageModel } from "@effect/ai";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import type { OntologyContext } from "../../src/Ontology/OntologyService";

// =============================================================================
// Mock Response Registry
// =============================================================================

/**
 * Registry for mock responses keyed by objectName
 */
const mockResponses = new Map<string, unknown>();

/**
 * Set a mock response for a specific objectName
 *
 * @example
 * ```typescript
 * setMockResponse("MentionOutput", {
 *   mentions: [{ text: "John", startChar: 0, endChar: 4, confidence: 0.9 }]
 * })
 * ```
 */
export const setMockResponse = (key: string, response: unknown): void => {
  mockResponses.set(key, response);
};

/**
 * Clear all mock responses
 */
export const clearMockResponses = (): void => {
  mockResponses.clear();
};

/**
 * Setup multiple mock responses at once
 */
export const setupMockResponses = (responses: Record<string, unknown>): void => {
  clearMockResponses();
  for (const [key, value] of Struct.entries(responses)) {
    setMockResponse(key, value);
  }
};

// =============================================================================
// Mock LanguageModel Implementation
// =============================================================================

/**
 * Create a mock LanguageModel service
 *
 * CRITICAL PATTERN: Uses `as unknown as LanguageModel.Service` cast
 * because @effect/ai has complex generic signatures.
 */
const createMockLanguageModel = () => ({
  generateObject: (options: { prompt: unknown; schema: unknown; objectName?: string }) =>
    Effect.succeed({
      value:
        options.objectName && mockResponses.has(options.objectName)
          ? mockResponses.get(options.objectName)
          : mockResponses.size > 0
            ? mockResponses.values().next().value
            : {},
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
      text: "Mock generated text",
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
});

// =============================================================================
// Mock Layers
// =============================================================================

/**
 * MockLlmLive - Test Layer for LanguageModel
 *
 * Use this Layer in tests to avoid real LLM API calls.
 *
 * @example
 * ```typescript
 * import { effect, strictEqual } from "@beep/testkit"
 * import { MockLlmLive, setMockResponse } from "../_shared/TestLayers"
 *
 * effect("extracts mentions", () =>
 *   Effect.gen(function* () {
 *     setMockResponse("MentionOutput", { mentions: [...] })
 *
 *     const extractor = yield* MentionExtractor
 *     const result = yield* extractor.extractFromChunk(chunk)
 *
 *     strictEqual(result.mentions.length, 1)
 *   }).pipe(
 *     Effect.provide(MentionExtractor.Default),
 *     Effect.provide(MockLlmLive)
 *   )
 * )
 * ```
 */
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  createMockLanguageModel() as unknown as LanguageModel.Service
);

/**
 * Create a custom mock Layer with a specific fixed response
 */
export const createMockLlmWithResponse = <A>(response: A) =>
  Layer.succeed(LanguageModel.LanguageModel, {
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
  } as unknown as LanguageModel.Service);

/**
 * Create a failing mock Layer for error testing
 */
export const createFailingMockLlm = (error: Error) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () => Effect.fail(error),
    generateText: () => Effect.fail(error),
    streamText: () => Effect.fail(error),
  } as unknown as LanguageModel.Service);

/**
 * Create a mock that tracks calls for verification
 */
export const createTrackingMockLlm = <A>(response: A) => {
  const calls: Array<{ options: unknown }> = [];

  const layer = Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: (options: unknown) => {
      calls.push({ options });
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
      } as unknown);
    },
    generateText: (options: unknown) => {
      calls.push({ options });
      return Effect.succeed({
        text: "",
        content: [],
        reasoning: null,
        reasoningText: "",
        toolCalls: [],
        toolCallResults: [],
        finishReason: "stop",
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      } as unknown);
    },
    streamText: () =>
      Effect.succeed({
        stream: Effect.succeed([]),
      } as unknown),
  } as unknown as LanguageModel.Service);

  return {
    layer,
    getCalls: () => [...calls],
    clearCalls: () => {
      calls.length = 0;
    },
  };
};

// =============================================================================
// Test Data Factories
// =============================================================================

import type { ParsedClassDefinition, ParsedPropertyDefinition } from "../../src/Ontology/OntologyParser";

/**
 * Create a minimal OntologyContext for testing
 */
export const createMockOntologyContext = (options?: {
  classes?: Array<{ iri: string; label: string }>;
  properties?: Array<{ iri: string; label: string }>;
}): OntologyContext => {
  const classes: ParsedClassDefinition[] =
    options?.classes?.map((c) => ({
      iri: c.iri,
      label: c.label,
      localName: c.label,
      comment: O.none(),
      prefLabels: [],
      altLabels: [],
      hiddenLabels: [],
      definition: O.none(),
      scopeNote: O.none(),
      example: O.none(),
      properties: [],
      broader: [],
      narrower: [],
      related: [],
      equivalentClass: [],
      exactMatch: [],
      closeMatch: [],
    })) ?? [];

  const properties: ParsedPropertyDefinition[] =
    options?.properties?.map((p) => ({
      iri: p.iri,
      label: p.label,
      localName: p.label,
      comment: O.none(),
      domain: [],
      range: [],
      rangeType: "object" as const,
      isFunctional: false,
      inverseOf: [],
      prefLabels: [],
      altLabels: [],
      hiddenLabels: [],
      definition: O.none(),
      scopeNote: O.none(),
      example: O.none(),
      broader: [],
      narrower: [],
      related: [],
      exactMatch: [],
      closeMatch: [],
    })) ?? [];

  const classMap = new Map(classes.map((c) => [c.iri, c]));
  const propertyMap = new Map(properties.map((p) => [p.iri, p]));

  return {
    classes,
    properties,
    classHierarchy: {},
    propertyHierarchy: {},
    getPropertiesForClass: () => [],
    isSubClassOf: () => false,
    getAncestors: () => [],
    findClass: (iri) => (classMap.has(iri) ? O.some(classMap.get(iri)!) : O.none()),
    findProperty: (iri) => (propertyMap.has(iri) ? O.some(propertyMap.get(iri)!) : O.none()),
  };
};
