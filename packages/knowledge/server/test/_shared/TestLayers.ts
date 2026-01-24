/**
 * Test Layers for Knowledge Server Tests
 *
 * Provides mock implementations for testing services that depend on
 * @effect/ai LanguageModel and other external dependencies.
 *
 * Uses `LanguageModel.make()` pattern from @effect/ai - intercepting at the
 * provider level (generateText/streamText) rather than the service level.
 *
 * @module knowledge-server/test/_shared/TestLayers
 * @since 0.1.0
 */

import type { ParsedClassDefinition, ParsedPropertyDefinition } from "@beep/knowledge-server/Ontology/OntologyParser";
import type { OntologyContext } from "@beep/knowledge-server/Ontology/OntologyService";
import { LanguageModel } from "@effect/ai";
import type * as Response from "@effect/ai/Response";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

// =============================================================================
// Mock Response Types
// =============================================================================

/**
 * Options for mock LanguageModel responses
 *
 * @since 0.1.0
 * @category types
 */
export interface MockLanguageModelOptions {
  /**
   * Mock response for generateObject calls.
   * Can be a static value or a function that receives the objectName.
   */
  readonly generateObject?: unknown | ((objectName: string | undefined) => unknown | Effect.Effect<unknown>);

  /**
   * Token usage to report
   */
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
  };
}

// =============================================================================
// Default Usage
// =============================================================================

const defaultUsage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };

// =============================================================================
// Provider-Level Mock (Clean Pattern)
// =============================================================================

/**
 * Build response parts for the mock provider.
 *
 * When responseFormat.type === "json", returns a text part with JSON-stringified
 * mock data. The framework's resolveStructuredOutput will parse it.
 *
 * @internal
 */
const buildProviderResponse = (value: unknown, usage: typeof defaultUsage): Array<Response.PartEncoded> => [
  { type: "text", text: JSON.stringify(value) },
  {
    type: "finish",
    reason: "stop",
    usage: {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    },
  },
];

// =============================================================================
// withLanguageModel - Effect AI Pattern
// =============================================================================

/**
 * Provide a mock LanguageModel for testing
 *
 * Uses `LanguageModel.make()` to create a properly-typed service from
 * provider-level callbacks. This approach:
 * - Intercepts at generateText/streamText (simple signatures)
 * - Lets the framework derive generateObject internally
 * - Minimizes type assertion surface area
 *
 * @example
 * ```typescript
 * import { effect } from "@beep/testkit";
 * import { withLanguageModel } from "../_shared/TestLayers";
 *
 * effect("extracts mentions", () =>
 *   Effect.gen(function* () {
 *     const extractor = yield* MentionExtractor;
 *     const result = yield* extractor.extractFromChunk(chunk);
 *     strictEqual(result.mentions.length, 2);
 *   }).pipe(
 *     Effect.provide(MentionExtractor.Default),
 *     withLanguageModel({
 *       generateObject: (objectName) => {
 *         if (objectName === "MentionOutput") {
 *           return { mentions: [...] };
 *         }
 *         return {};
 *       }
 *     })
 *   )
 * );
 * ```
 *
 * @since 0.1.0
 * @category test utilities
 */
export const withLanguageModel: {
  (
    options: MockLanguageModelOptions
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: MockLanguageModelOptions
  ): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: MockLanguageModelOptions
  ): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>> => {
    const usage = options.usage ?? defaultUsage;

    const getResponseValue = (objectName: string | undefined): Effect.Effect<unknown, never, never> => {
      if (P.isUndefined(options.generateObject)) {
        return Effect.succeed({});
      }

      if (P.isFunction(options.generateObject)) {
        const result = options.generateObject(objectName);
        return Effect.isEffect(result) ? (result as Effect.Effect<unknown, never, never>) : Effect.succeed(result);
      }

      return Effect.succeed(options.generateObject);
    };

    // Use LanguageModel.make() - this returns Effect<Service> with proper types
    const makeService = LanguageModel.make({
      generateText: (providerOptions) => {
        // When responseFormat.type === "json", extract objectName and return mock
        if (providerOptions.responseFormat.type === "json") {
          const objectName = providerOptions.responseFormat.objectName;
          return Effect.map(getResponseValue(objectName), (value) => buildProviderResponse(value, usage));
        }
        // For text responses, return empty
        return Effect.succeed(buildProviderResponse("", usage));
      },
      streamText: () => Stream.empty,
    });

    return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService) as Effect.Effect<
      A,
      E,
      Exclude<R, LanguageModel.LanguageModel>
    >;
  }
);

// =============================================================================
// Specialized Mock Factories
// =============================================================================

/**
 * Create a mock LanguageModel with a specific fixed response
 *
 * @since 0.1.0
 * @category test utilities
 */
export const createMockLlmWithResponse = <A>(response: A) => withLanguageModel({ generateObject: () => response });

/**
 * Create a failing mock LanguageModel for error testing
 *
 * @since 0.1.0
 * @category test utilities
 */
export const createFailingMockLlm =
  <E>(error: E) =>
  <A, E2, R>(effect: Effect.Effect<A, E2, R>): Effect.Effect<A, E | E2, Exclude<R, LanguageModel.LanguageModel>> => {
    const makeService = LanguageModel.make({
      generateText: () => Effect.fail(error as never),
      streamText: () => Stream.fail(error as never),
    });
    return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService) as Effect.Effect<
      A,
      E | E2,
      Exclude<R, LanguageModel.LanguageModel>
    >;
  };

/**
 * Create a mock that tracks calls for verification
 *
 * @since 0.1.0
 * @category test utilities
 */
export const createTrackingMockLlm = <A>(response: A) =>
  Effect.gen(function* () {
    const callsRef = yield* Ref.make<Array<{ objectName: string | undefined }>>([]);

    const withTracking = <A2, E, R>(
      effect: Effect.Effect<A2, E, R>
    ): Effect.Effect<A2, E, Exclude<R, LanguageModel.LanguageModel>> => {
      const makeService = LanguageModel.make({
        generateText: (providerOptions) => {
          const objectName =
            providerOptions.responseFormat.type === "json" ? providerOptions.responseFormat.objectName : undefined;
          return Ref.update(callsRef, A.append({ objectName })).pipe(
            Effect.map(() => buildProviderResponse(response, defaultUsage))
          );
        },
        streamText: () => Stream.empty,
      });

      return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService) as Effect.Effect<
        A2,
        E,
        Exclude<R, LanguageModel.LanguageModel>
      >;
    };

    const getCalls = Ref.get(callsRef);
    const clearCalls = Ref.set(callsRef, []);

    return { withTracking, getCalls, clearCalls };
  });

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Create a minimal OntologyContext for testing
 *
 * @since 0.1.0
 * @category test data
 */
export const createMockOntologyContext = (options?: {
  classes?: Array<{ iri: string; label: string }>;
  properties?: Array<{ iri: string; label: string }>;
}): OntologyContext => {
  const classes: ParsedClassDefinition[] = A.map(options?.classes ?? [], (c) => ({
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
  }));

  const properties: ParsedPropertyDefinition[] = A.map(options?.properties ?? [], (p) => ({
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
  }));

  const classMap = MutableHashMap.fromIterable(A.map(classes, (c) => [c.iri, c] as const));
  const propertyMap = MutableHashMap.fromIterable(A.map(properties, (p) => [p.iri, p] as const));

  return {
    classes,
    properties,
    classHierarchy: {},
    propertyHierarchy: {},
    getPropertiesForClass: () => [],
    isSubClassOf: () => false,
    getAncestors: () => [],
    findClass: (iri) => MutableHashMap.get(classMap, iri),
    findProperty: (iri) => MutableHashMap.get(propertyMap, iri),
  };
};
