import { KnowledgeGraphToolsLayer } from "@beep/web/lib/effect/tool-handlers";
import { GraphitiService } from "@beep/web/lib/graphiti/client";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { Config, Effect, Layer, pipe } from "effect";
import * as Redacted from "effect/Redacted";
import * as String from "effect/String";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";

const OpenAiApiKey = pipe(process.env.OPENAI_API_KEY ?? process.env.AI_OPENAI_API_KEY ?? "", String.trim);

export const OpenAiClientLayer = OpenAiClient.layer({
  apiKey: Redacted.make(OpenAiApiKey),
}).pipe(Layer.provide(FetchHttpClient.layer));

const OpenAiModelConfig = Config.string("OPENAI_MODEL").pipe(Config.withDefault(() => "gpt-4o-mini"));

export const OpenAiLanguageModelLayer = Layer.unwrap(
  Effect.gen(function* () {
    const openAiModel = yield* OpenAiModelConfig;
    return OpenAiLanguageModel.model(openAiModel);
  })
);

export const OpenAiRuntimeLayer = Layer.mergeAll(OpenAiClientLayer, OpenAiLanguageModelLayer);

export const KnowledgeGraphRuntimeLayer = Layer.mergeAll(GraphitiService.layer, KnowledgeGraphToolsLayer);

export const AppRuntimeLayer = Layer.mergeAll(KnowledgeGraphRuntimeLayer, OpenAiRuntimeLayer);
