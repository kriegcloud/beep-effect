import type { ModelFamily } from "@app/domain/ai-models";
import * as OpenAiClient from "@effect/ai-openai-compat/OpenAiClient";
import * as OpenAiLanguageModel from "@effect/ai-openai-compat/OpenAiLanguageModel";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";

const normalizeOllamaMessages = (payload: unknown) => {
  if (typeof payload !== "object" || payload === null) {
    return payload;
  }

  const messages = "messages" in payload ? payload.messages : undefined;
  if (!Array.isArray(messages)) {
    return payload;
  }

  let changed = false;
  const nextMessages = messages.map((message) => {
    if (
      typeof message === "object"
      && message !== null
      && "role" in message
      && message.role === "assistant"
      && "content" in message
      && message.content === null
      && !("tool_calls" in message)
    ) {
      changed = true;
      return { ...message, content: "" };
    }
    return message;
  });

  return changed ? { ...payload, messages: nextMessages } : payload;
};

const withOllamaCompatibility = HttpClient.mapRequest((request) => {
  if (
    request.method !== "POST"
    || !request.url.endsWith("/chat/completions")
    || request.body._tag !== "Uint8Array"
    || !request.body.contentType.endsWith("json")
  ) {
    return request;
  }

  try {
    return request.pipe(
      HttpClientRequest.bodyJsonUnsafe(
        normalizeOllamaMessages(JSON.parse(new TextDecoder().decode(request.body.body))),
      ),
    );
  } catch {
    return request;
  }
});

const OllamaLive = OpenAiClient.layerConfig({
  apiUrl: Config.string("OLLAMA_API_URL").pipe(Config.withDefault("http://localhost:11434/v1")),
  transformClient: withOllamaCompatibility,
}).pipe(Layer.provide(FetchHttpClient.layer));

const QwenModel = OpenAiLanguageModel.model("qwen3.6-uncensored:35b");
const LlamaModel = OpenAiLanguageModel.model("llama3.2");

export class AiModels extends Context.Service<AiModels>()("@app/ai/AiModels", {
  make: Effect.gen(function*() {
    const qwenModel = yield* QwenModel.captureRequirements;
    const llamaModel = yield* LlamaModel.captureRequirements;

    const getModelLayer = (
      model: ModelFamily,
    ): Layer.Layer<LanguageModel.LanguageModel> => {
      switch (model) {
        case "qwen3.6-uncensored:35b":
          return qwenModel;
        case "llama3.2":
          return llamaModel;
      }
    };

    return {
      use: (model: ModelFamily) =>
      <A, E, R>(
        self: Effect.Effect<A, E, R>,
      ): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>> =>
        Effect.provide(self, getModelLayer(model)),
    } as const;
  }),
}) {
  static layer: Layer.Layer<AiModels> = Layer.effect(this, this.make).pipe(
    Layer.provide(OllamaLive),
    Layer.orDie,
  );
}
