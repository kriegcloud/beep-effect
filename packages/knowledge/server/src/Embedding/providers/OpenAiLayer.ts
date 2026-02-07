import type * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import {OpenAiClient, OpenAiEmbeddingModel} from "@effect/ai-openai";
import {FetchHttpClient} from "@effect/platform";
import * as Config from "effect/Config";
import type {ConfigError} from "effect/ConfigError";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import {$KnowledgeServerId} from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Embedding/providers/OpenAiLayer");


const DEFAULT_MODEL = "text-embedding-3-small";

const DEFAULT_DIMENSIONS = 768;

export class OpenAiEmbeddingConfig extends S.Class<OpenAiEmbeddingConfig>($I`OpenAiEmbeddingConfig`)(
  {
    model: S.optional(S.String),
    dimensions: S.optional(S.Number),
    maxBatchSize: S.optional(S.Number),
  }
) {
}


export const makeOpenAiEmbeddingLayer = (
  options?: undefined | OpenAiEmbeddingConfig
): Layer.Layer<EmbeddingModel.EmbeddingModel, never, OpenAiClient.OpenAiClient> => {
  const config: OpenAiEmbeddingModel.Config.Batched = {
    dimensions: options?.dimensions ?? DEFAULT_DIMENSIONS,
    ...(options?.maxBatchSize !== undefined ? {maxBatchSize: options.maxBatchSize} : {}),
  };
  return OpenAiEmbeddingModel.layerBatched({
    model: options?.model ?? DEFAULT_MODEL,
    config,
  });
};

export const OpenAiEmbeddingLayerConfig: Layer.Layer<EmbeddingModel.EmbeddingModel, ConfigError> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("OPENAI_API_KEY");
    const model = yield* Config.string("OPENAI_EMBEDDING_MODEL").pipe(Config.withDefault(DEFAULT_MODEL));
    const dimensions = yield* Config.integer("OPENAI_EMBEDDING_DIMENSIONS").pipe(
      Config.withDefault(DEFAULT_DIMENSIONS)
    );

    return makeOpenAiEmbeddingLayer({model, dimensions}).pipe(
      Layer.provide(OpenAiClient.layer({apiKey})),
      Layer.provide(FetchHttpClient.layer)
    );
  })
);

export const OpenAiEmbeddingLayer = (
  apiKey: string,
  options?: OpenAiEmbeddingConfig
): Layer.Layer<EmbeddingModel.EmbeddingModel> =>
  makeOpenAiEmbeddingLayer(options).pipe(
    Layer.provide(
      OpenAiClient.layer({
        apiKey: Redacted.make(apiKey),
      })
    ),
    Layer.provide(FetchHttpClient.layer)
  );
