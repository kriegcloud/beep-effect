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

export interface MockLanguageModelOptions {
  readonly generateObject?: unknown | ((objectName: string | undefined) => unknown | Effect.Effect<unknown>);
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
  };
}

const defaultUsage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };

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

    const makeService = LanguageModel.make({
      generateText: (providerOptions) => {
        if (providerOptions.responseFormat.type === "json") {
          const objectName = providerOptions.responseFormat.objectName;
          return Effect.map(getResponseValue(objectName), (value) => buildProviderResponse(value, usage));
        }
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

export const createMockLlmWithResponse = <A>(response: A) => withLanguageModel({ generateObject: () => response });

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

export const createTrackingMockLlm = <A>(response: A) =>
  Effect.gen(function* () {
    const callsRef = yield* Ref.make<ReadonlyArray<{ objectName: string | undefined }>>([]);

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
    const clearCalls = Ref.set(callsRef, [] as ReadonlyArray<{ objectName: string | undefined }>);

    return { withTracking, getCalls, clearCalls };
  });

export const createMockOntologyContext = (options?: {
  classes?: ReadonlyArray<{ iri: string; label: string }>;
  properties?: ReadonlyArray<{ iri: string; label: string }>;
}): OntologyContext => {
  const classes: ReadonlyArray<ParsedClassDefinition> = A.map(options?.classes ?? [], (c) => ({
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

  const properties: ReadonlyArray<ParsedPropertyDefinition> = A.map(options?.properties ?? [], (p) => ({
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
    findClass: (iri: string) => MutableHashMap.get(classMap, iri),
    findProperty: (iri: string) => MutableHashMap.get(propertyMap, iri),
  };
};
