import { ChatService } from "@repo/ai";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import { Effect, Queue } from "effect";
import { Prompt } from "effect/unstable/ai";

export const EventRpcLive = EventRpc.toLayer(
  Effect.gen(function* () {
    const bot = yield* ChatService;
    yield* Effect.log("Starting Event RPC Live Implementation");
    return EventRpc.of({
      tick: Effect.fn(function* (payload) {
        yield* Effect.log("Creating new tick stream");
        const queue = yield* Queue.unbounded<typeof TickEvent.Type>();
        yield* Effect.forkScoped(
          Effect.gen(function* () {
            yield* Queue.offer(queue, { _tag: "starting" });
            yield* Effect.sleep("3 seconds");
            for (let i = 0; i < payload.ticks; i++) {
              yield* Effect.sleep("1 second");
              yield* Queue.offer(queue, { _tag: "tick" });
            }
            yield* Queue.offer(queue, { _tag: "end" });
            yield* Effect.log("End event sent");
          }).pipe(Effect.ensuring(Queue.shutdown(queue))),
        );
        return queue;
      }),
      chat: ({ messages }) =>
        bot.chat(
          messages.map((msg) => {
            if (msg.role === "system") {
              return Prompt.makeMessage(msg.role, {
                content: msg.content,
              });
            }
            return Prompt.makeMessage(msg.role, {
              content: [Prompt.makePart("text", { text: msg.content })],
            });
          }),
        ),
    });
  }),
);
