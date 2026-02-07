import { LanguageModel } from "@effect/ai";
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type * as Redacted from "effect/Redacted";
import { FallbackLanguageModel } from "../LlmControl/FallbackLanguageModel";

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

export const LlmFallbackConfig = Config.all({
  provider: Config.string("LLM_FALLBACK_PROVIDER").pipe(Config.option),
  apiKey: Config.redacted("LLM_FALLBACK_API_KEY").pipe(Config.option),
  model: Config.string("LLM_FALLBACK_MODEL").pipe(Config.option),
});

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    const primary =
      config.provider === "openai"
        ? makeOpenAiLayer(config.apiKey, config.model)
        : makeAnthropicLayer(config.apiKey, config.model);

    const fallbackConfig = yield* LlmFallbackConfig;
    const fallbackLayer = O.match(O.all([fallbackConfig.provider, fallbackConfig.apiKey, fallbackConfig.model]), {
      onNone: () => Layer.succeed(FallbackLanguageModel, O.none()),
      onSome: ([provider, apiKey, model]) =>
        Layer.effect(
          FallbackLanguageModel,
          Effect.serviceOptional(LanguageModel.LanguageModel).pipe(Effect.map(O.some))
        ).pipe(
          Layer.provide(provider === "openai" ? makeOpenAiLayer(apiKey, model) : makeAnthropicLayer(apiKey, model))
        ),
    });

    return Layer.merge(primary, fallbackLayer);
  })
);
