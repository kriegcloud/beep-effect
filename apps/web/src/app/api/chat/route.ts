import { auth } from "@beep/web/lib/auth/server";
import { createChatSseResponse } from "@beep/web/lib/effect/chat-handler";
import { makeChatRouteLayer } from "@beep/web/lib/effect/chat-route";
import { KnowledgeGraphRuntimeLayer, OpenAiClientLayer } from "@beep/web/lib/effect/runtime";
import { OpenAiLanguageModel } from "@effect/ai-openai";
import { Layer } from "effect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";

const defaultRouteOptions = {
  getSession: (headers: Headers) => auth.api.getSession({ headers }),
  createResponse: createChatSseResponse,
};

const ChatLanguageModelLayer = OpenAiLanguageModel.model(process.env.OPENAI_MODEL ?? "gpt-4o-mini", {
  max_output_tokens: 4096,
});

const ChatRouteLayer = makeChatRouteLayer(defaultRouteOptions).pipe(
  Layer.provide(KnowledgeGraphRuntimeLayer),
  Layer.provide(ChatLanguageModelLayer),
  Layer.provide(OpenAiClientLayer)
);

const ChatRouteAppLayer = Layer.mergeAll(HttpRouter.layer, ChatRouteLayer);

const { handler } = HttpRouter.toWebHandler(ChatRouteAppLayer);

export const POST = handler;
