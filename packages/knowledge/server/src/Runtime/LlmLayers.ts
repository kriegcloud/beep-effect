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
  provider: Config.string("AI_LLM_PROVIDER").pipe(Config.withDefault("openai")),
  openAiApiKey: Config.redacted("AI_OPENAI_API_KEY").pipe(Config.orElse(() => Config.redacted("OPENAI_API_KEY"))),
  anthropicApiKey: Config.redacted("AI_ANTHROPIC_API_KEY").pipe(
    Config.orElse(() => Config.redacted("ANTHROPIC_API_KEY"))
  ),
  model: Config.string("AI_LLM_MODEL").pipe(Config.withDefault("gpt-4o-mini")),
});

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return config.provider === "anthropic"
      ? makeAnthropicLayer(config.anthropicApiKey, config.model)
      : makeOpenAiLayer(config.openAiApiKey, config.model);
  })
);
