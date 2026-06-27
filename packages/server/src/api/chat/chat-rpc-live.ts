import { ChatRepo } from "@/db/chat-repo.js";
import * as Chat from "@app/domain/api/chat-rpc";
import { CurrentUser } from "@app/domain/auth";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import type * as Rpc from "effect/unstable/rpc/Rpc";
import { ChatRunManager } from "./chat-run-manager.js";

export const ChatRpcHandler = Chat.ChatRpc.toLayer(
  Effect.gen(function*() {
    const chatRepo = yield* ChatRepo;
    const runManager = yield* ChatRunManager;

    return Chat.ChatRpc.of({
      chat_events: (payload) =>
        Stream.unwrap(
          Effect.gen(function*() {
            const currentUser = yield* CurrentUser;
            return runManager.subscribe(payload.runId, currentUser.id);
          }),
        ),

      chat_watch: (payload) =>
        Stream.unwrap(
          Effect.gen(function*() {
            const currentUser = yield* CurrentUser;
            const chat = yield* chatRepo.findById(payload.chatId, currentUser.id);
            return Stream.make(
              {
                _tag: "RunChanged",
                runId: chat.activeRunId,
              } satisfies Chat.ChatWatchEvent,
            ).pipe(Stream.concat(runManager.watch(payload.chatId)));
          }),
        ),

      chat_ask: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        const chat = yield* chatRepo.findById(payload.chatId, currentUser.id);

        return yield* runManager.startGeneration({
          chat,
          message: payload.message,
        });
      }),

      chat_interrupt: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        yield* chatRepo.findById(payload.chatId, currentUser.id);
        yield* runManager.interrupt(payload.chatId);
      }),

      chat_create: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        return yield* chatRepo.create({
          userId: currentUser.id,
          title: payload.title,
          model: payload.model,
        });
      }),

      chat_list: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        return yield* chatRepo.listByUser(currentUser.id, Option.fromNullOr(payload.cursor));
      }),

      chat_get: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        return yield* chatRepo.findById(payload.chatId, currentUser.id);
      }),

      chat_delete: Effect.fnUntraced(function*(payload) {
        const currentUser = yield* CurrentUser;
        yield* chatRepo.delete(payload.chatId, currentUser.id);
      }),
    });
  }),
);

export const ChatRpcLive: Layer.Layer<
  | Rpc.Handler<"chat_events">
  | Rpc.Handler<"chat_watch">
  | Rpc.Handler<"chat_ask">
  | Rpc.Handler<"chat_interrupt">
  | Rpc.Handler<"chat_create">
  | Rpc.Handler<"chat_list">
  | Rpc.Handler<"chat_get">
  | Rpc.Handler<"chat_delete">
> = ChatRpcHandler.pipe(
  Layer.provide(ChatRunManager.layer),
  Layer.provide(ChatRepo.layer),
);
