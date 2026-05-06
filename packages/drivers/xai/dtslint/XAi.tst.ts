import { XAi, XAiConfigInput, type XAiError, XAiLanguageModel } from "@beep/xai";
import type { Effect, Layer } from "effect";
import type * as LanguageModel from "effect/unstable/ai/LanguageModel";
import type * as AiModel from "effect/unstable/ai/Model";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { describe, expect, it } from "tstyche";

describe("XAi", () => {
  it("preserves layer types", () => {
    expect(XAi.makeLayer(new XAiConfigInput({ apiKey: "test-key" }))).type.toBeAssignableTo<
      Layer.Layer<XAi, never, HttpClient.HttpClient>
    >();
    expect(XAi.layer).type.toBeAssignableTo<Layer.Layer<XAi, XAiError>>();
  });

  it("preserves Effect AI language model adapter types", () => {
    expect(XAiLanguageModel.make({ model: "grok-test-model" })).type.toBeAssignableTo<
      Effect.Effect<LanguageModel.Service, never, XAi>
    >();
    expect(XAiLanguageModel.layer({ model: "grok-test-model" })).type.toBeAssignableTo<
      Layer.Layer<LanguageModel.LanguageModel, never, XAi>
    >();
    expect(XAiLanguageModel.model("grok-test-model")).type.toBeAssignableTo<
      AiModel.Model<"xai", LanguageModel.LanguageModel, XAi>
    >();
  });
});
