import { KnowledgeGraphToolsLayer } from "@beep/web/lib/effect/tool-handlers";
import { GraphitiService } from "@beep/web/lib/graphiti/client";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { Layer, Redacted } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";

const openAiApiKey = process.env.OPENAI_API_KEY ?? "";
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export const OpenAiClientLayer = OpenAiClient.layer({
  apiKey: Redacted.make(openAiApiKey),
}).pipe(Layer.provide(FetchHttpClient.layer));

export const OpenAiLanguageModelLayer = OpenAiLanguageModel.model(openAiModel);

export const OpenAiRuntimeLayer = Layer.mergeAll(OpenAiClientLayer, OpenAiLanguageModelLayer);

export const KnowledgeGraphRuntimeLayer = Layer.mergeAll(GraphitiService.layer, KnowledgeGraphToolsLayer);

export const AppRuntimeLayer = Layer.mergeAll(KnowledgeGraphRuntimeLayer, OpenAiRuntimeLayer);
