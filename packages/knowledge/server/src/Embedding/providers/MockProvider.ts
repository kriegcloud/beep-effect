import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const MOCK_DIMENSIONS = 768;

const createZeroVector = (dimensions: number): Array<number> => A.replicate(0, dimensions);

const createDeterministicVector = (text: string, dimensions: number): Array<number> => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return A.makeBy(dimensions, (i) => {
    const seed = hash + i * 7919;
    return ((seed % 1000) / 500 - 1) * 0.1;
  });
};

export interface MockProviderOptions {
  readonly deterministic?: undefined | boolean;
  readonly dimensions?: undefined | number;
}

export const makeMockService = (options: MockProviderOptions = {}): EmbeddingModel.Service => {
  const dimensions = options.dimensions ?? MOCK_DIMENSIONS;
  const deterministic = options.deterministic ?? false;

  const createVector = (text: string): Array<number> =>
    deterministic ? createDeterministicVector(text, dimensions) : createZeroVector(dimensions);

  return {
    embed: (input: string) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("MockEmbeddingModel.embed").pipe(Effect.annotateLogs({ textLength: input.length }));
        return createVector(input);
      }),

    embedMany: (inputs: ReadonlyArray<string>) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("MockEmbeddingModel.embedMany").pipe(Effect.annotateLogs({ count: inputs.length }));
        return A.map(inputs, createVector);
      }),
  };
};

export const MockEmbeddingModelLayer: Layer.Layer<EmbeddingModel.EmbeddingModel> = Layer.succeed(
  EmbeddingModel.EmbeddingModel,
  makeMockService()
);

export const DeterministicMockEmbeddingModelLayer: Layer.Layer<EmbeddingModel.EmbeddingModel> = Layer.succeed(
  EmbeddingModel.EmbeddingModel,
  makeMockService({ deterministic: true })
);

export const makeMockEmbeddingModelLayer = (options: MockProviderOptions): Layer.Layer<EmbeddingModel.EmbeddingModel> =>
  Layer.succeed(EmbeddingModel.EmbeddingModel, makeMockService(options));

export const MockConfig = {
  model: "mock-embedding-model",
  dimensions: MOCK_DIMENSIONS,
  provider: "mock",
};
