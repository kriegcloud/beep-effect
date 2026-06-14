import {
  AnthropicLanguageModelLive,
  AnthropicLanguageModelOptions,
  AnthropicLive,
  makeAnthropicLanguageModelLayer,
} from "@beep/anthropic";
import { describe, expect, it } from "tstyche";
import type { AnthropicClient } from "@effect/ai-anthropic";
import type { Config, Layer } from "effect";
import type * as LanguageModel from "effect/unstable/ai/LanguageModel";

describe("Anthropic", () => {
  it("preserves live layer types", () => {
    expect(AnthropicLive).type.toBeAssignableTo<
      Layer.Layer<AnthropicClient.AnthropicClient, Config.ConfigError, never>
    >();
    expect(AnthropicLanguageModelLive).type.toBeAssignableTo<
      Layer.Layer<LanguageModel.LanguageModel, Config.ConfigError, never>
    >();
  });

  it("preserves language-model option typing", () => {
    expect(
      makeAnthropicLanguageModelLayer(AnthropicLanguageModelOptions.make({ model: "claude-opus-4-6" }))
    ).type.toBeAssignableTo<Layer.Layer<LanguageModel.LanguageModel, Config.ConfigError, never>>();
  });
});
