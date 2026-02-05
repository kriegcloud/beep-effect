import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";

const makeAnthropicLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(AnthropicClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer)))
  );

const makeOpenAiLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  OpenAiLanguageModel.layer({ model }).pipe(
    Layer.provide(OpenAiClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer)))
  );

export const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(Config.withDefault("anthropic")),
  apiKey: Config.redacted("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-sonnet-4-20250514")),
});

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return config.provider === "openai"
      ? makeOpenAiLayer(config.apiKey, config.model)
      : makeAnthropicLayer(config.apiKey, config.model);
  })
);
