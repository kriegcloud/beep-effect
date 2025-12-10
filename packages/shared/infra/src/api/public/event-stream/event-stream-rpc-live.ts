import { Policy } from "@beep/shared-domain";
import { EventStreamEvents, EventStreamRpc, Ka } from "@beep/shared-domain/api/event-stream-rpc";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import { constant } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Mailbox from "effect/Mailbox";
import * as Stream from "effect/Stream";
import { EventStreamHub } from "./event-stream-hub";

export const EventStreamRpcLive = EventStreamRpc.toLayer(
  Effect.gen(function* () {
    const eventStreamHub = yield* EventStreamHub;

    const ka: [Ka] = [{ _tag: "Ka" }];
    const kaStream = Stream.tick("3 seconds").pipe(Stream.map(constant(ka)));

    return EventStreamRpc.of({
      eventStream_connect: Effect.fnUntraced(function* () {
        const {user: currentUser} = yield* Policy.AuthContext;
        const connectionId = crypto.randomUUID();
        const mailbox = yield* Mailbox.make<EventStreamEvents>();

        yield* Effect.acquireRelease(
          eventStreamHub.registerConnection(currentUser.id, {
            connectionId,
            mailbox,
          }),
          () => eventStreamHub.unregisterConnection(currentUser.id, connectionId),
        );

        const eventStream = Mailbox.toStream(mailbox).pipe(
          Stream.groupedWithin(25, "50 millis"),
          Stream.map((chunk) => Chunk.toArray(chunk)),
        );

        return Stream.merge(eventStream, kaStream, { haltStrategy: "either" });
      }, Stream.unwrapScoped),
    });
  }),
).pipe(Layer.provide(EventStreamHub.Default));
