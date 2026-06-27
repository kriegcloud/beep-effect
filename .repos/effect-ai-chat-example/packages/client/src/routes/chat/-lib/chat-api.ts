import { DomainRpcClient } from "@/services/rpc-client.js";
import type { ModelFamily } from "@app/domain/ai-models";
import type { ChatId, RunId } from "@app/domain/api/chat-rpc";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class ChatApi extends Context.Service<ChatApi>()("@app/chat/ChatApi", {
  make: Effect.gen(function*() {
    const rpc = yield* DomainRpcClient;
    return {
      chatList: (cursor: Parameters<typeof rpc.chat_list>[0]["cursor"]) =>
        rpc.chat_list({ cursor }),
      chatGet: (chatId: ChatId) => rpc.chat_get({ chatId }),
      chatCreate: (args: { title: string; model: ModelFamily; }) => rpc.chat_create(args),
      chatDelete: (chatId: ChatId) => rpc.chat_delete({ chatId }),
      chatAsk: (args: { chatId: ChatId; message: string; }) => rpc.chat_ask(args),
      chatEvents: (runId: RunId) => rpc.chat_events({ runId }),
      chatWatch: (chatId: ChatId) => rpc.chat_watch({ chatId }),
      chatInterrupt: (chatId: ChatId) => rpc.chat_interrupt({ chatId }),
    };
  }),
}) {
  static layer: Layer.Layer<ChatApi> = Layer.effect(this, this.make).pipe(
    Layer.provide(DomainRpcClient.layer),
  );
}
