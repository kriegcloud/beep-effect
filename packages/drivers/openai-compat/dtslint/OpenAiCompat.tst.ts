import type {
  OpenAiCompatChatCompletionRequest,
  OpenAiCompatClientShape,
  OpenAiCompatLanguageModelConfig,
} from "@beep/openai-compat";
import { layer, make, model, OpenAiCompatClient, OpenAiCompatClientOptions } from "@beep/openai-compat";
import type { Effect, Layer } from "effect";
import { Redacted } from "effect";
import type * as LanguageModel from "effect/unstable/ai/LanguageModel";
import type * as AiModel from "effect/unstable/ai/Model";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { describe, expect, it } from "tstyche";

declare const client: OpenAiCompatClientShape;
declare const request: OpenAiCompatChatCompletionRequest;

describe("OpenAiCompat", () => {
  it("preserves client service signatures", () => {
    expect(client.createChatCompletion(request)).type.toBeAssignableTo<Effect.Effect<unknown, unknown>>();
    expect(
      OpenAiCompatClient.makeLayer(new OpenAiCompatClientOptions({ apiKey: Redacted.make("test-key") }))
    ).type.toBeAssignableTo<Layer.Layer<OpenAiCompatClient, never, HttpClient.HttpClient>>();
  });

  it("preserves language model factory surfaces", () => {
    const config: OpenAiCompatLanguageModelConfig = {
      maxTokens: 128,
      temperature: 0.1,
    };

    expect(make({ config, model: "compat-model" })).type.toBeAssignableTo<
      Effect.Effect<LanguageModel.Service, never, OpenAiCompatClient>
    >();
    expect(layer({ model: "compat-model" })).type.toBeAssignableTo<
      Layer.Layer<LanguageModel.LanguageModel, never, OpenAiCompatClient>
    >();
    expect(model("compat-model")).type.toBeAssignableTo<
      AiModel.Model<"openai-compat", LanguageModel.LanguageModel, OpenAiCompatClient>
    >();
  });
});
