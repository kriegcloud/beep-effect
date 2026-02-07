import { FallbackLanguageModel } from "@beep/knowledge-server/LlmControl/FallbackLanguageModel";
import { ParsedClassDefinition, ParsedPropertyDefinition } from "@beep/knowledge-server/Ontology/OntologyParser";
import { OntologyContext } from "@beep/knowledge-server/Ontology/OntologyService";
import { LanguageModel } from "@effect/ai";
import type * as AiError from "@effect/ai/AiError";
import type * as Response from "@effect/ai/Response";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

type LlmEnv = LanguageModel.LanguageModel | FallbackLanguageModel;

export interface MockLanguageModelOptions {
  readonly generateObject?: unknown | ((objectName: string | undefined) => unknown | Effect.Effect<unknown>);
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
  };
}

const defaultUsage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };

export interface TextResponsePartsOptions {
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
  };
}

export const buildTextResponseParts = (
  text: string,
  options?: TextResponsePartsOptions
): Array<Response.PartEncoded> => {
  const usage = options?.usage ?? defaultUsage;
  return [
    { type: "text", text },
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
};

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
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, LlmEnv>>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: MockLanguageModelOptions): Effect.Effect<A, E, Exclude<R, LlmEnv>>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: MockLanguageModelOptions
  ): Effect.Effect<A, E, Exclude<R, LlmEnv>> => {
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

    return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService).pipe(
      Effect.provideService(FallbackLanguageModel, O.none())
    ) as Effect.Effect<A, E, Exclude<R, LlmEnv>>;
  }
);

export const createMockLlmWithResponse = <A>(response: A) => withLanguageModel({ generateObject: () => response });

const provideTextLanguageModel = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  text: string,
  options?: TextResponsePartsOptions
): Effect.Effect<A, E, Exclude<R, LlmEnv>> => {
  const makeService = LanguageModel.make({
    generateText: () => Effect.succeed(buildTextResponseParts(text, options)),
    streamText: () => Stream.empty,
  });

  return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService).pipe(
    Effect.provideService(FallbackLanguageModel, O.none())
  ) as Effect.Effect<A, E, Exclude<R, LlmEnv>>;
};

export function withTextLanguageModel(
  text: string,
  options?: TextResponsePartsOptions
): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, LlmEnv>>;
export function withTextLanguageModel<A, E, R>(
  effect: Effect.Effect<A, E, R>,
  text: string,
  options?: TextResponsePartsOptions
): Effect.Effect<A, E, Exclude<R, LlmEnv>>;
export function withTextLanguageModel<A, E, R>(
  effectOrText: string | Effect.Effect<A, E, R>,
  textOrOptions?: string | TextResponsePartsOptions,
  maybeOptions?: TextResponsePartsOptions
):
  | Effect.Effect<A, E, Exclude<R, LlmEnv>>
  | (<A2, E2, R2>(effect: Effect.Effect<A2, E2, R2>) => Effect.Effect<A2, E2, Exclude<R2, LlmEnv>>) {
  if (typeof effectOrText === "string") {
    const text = effectOrText;
    const options = typeof textOrOptions === "string" ? maybeOptions : textOrOptions;
    return <A2, E2, R2>(effect: Effect.Effect<A2, E2, R2>) => provideTextLanguageModel(effect, text, options);
  }

  if (typeof textOrOptions !== "string") {
    throw new Error("withTextLanguageModel(effect, text, options) requires a text argument");
  }

  return provideTextLanguageModel(effectOrText, textOrOptions, maybeOptions);
}

export const createFailingMockLlm =
  (error: AiError.AiError) =>
  <A, E2, R>(effect: Effect.Effect<A, E2, R>): Effect.Effect<A, AiError.AiError | E2, Exclude<R, LlmEnv>> => {
    const makeService = LanguageModel.make({
      generateText: () => Effect.fail(error),
      streamText: () => Stream.fail(error),
    });
    return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService).pipe(
      Effect.provideService(FallbackLanguageModel, O.none())
    ) as Effect.Effect<A, AiError.AiError | E2, Exclude<R, LlmEnv>>;
  };

export const createTrackingMockLlm = <A>(response: A) =>
  Effect.gen(function* () {
    const callsRef = yield* Ref.make<ReadonlyArray<{ objectName: string | undefined }>>([]);

    const withTracking = <A2, E, R>(effect: Effect.Effect<A2, E, R>): Effect.Effect<A2, E, Exclude<R, LlmEnv>> => {
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

      return Effect.provideServiceEffect(effect, LanguageModel.LanguageModel, makeService).pipe(
        Effect.provideService(FallbackLanguageModel, O.none())
      ) as Effect.Effect<A2, E, Exclude<R, LlmEnv>>;
    };

    const getCalls = Ref.get(callsRef);
    const clearCalls = Ref.set(callsRef, [] as ReadonlyArray<{ objectName: string | undefined }>);

    return { withTracking, getCalls, clearCalls };
  });

export const createMockOntologyContext = (options?: {
  classes?: ReadonlyArray<{ iri: string; label: string }>;
  properties?: ReadonlyArray<{ iri: string; label: string }>;
}): OntologyContext => {
  const classes: ReadonlyArray<ParsedClassDefinition> = A.map(
    options?.classes ?? [],
    (c) => new ParsedClassDefinition({ iri: c.iri, label: c.label, localName: c.label })
  );

  const properties: ReadonlyArray<ParsedPropertyDefinition> = A.map(
    options?.properties ?? [],
    (p) => new ParsedPropertyDefinition({ iri: p.iri, label: p.label, localName: p.label, rangeType: "object" })
  );

  return new OntologyContext({
    classes,
    properties,
    classHierarchy: {},
    propertyHierarchy: {},
  });
};
