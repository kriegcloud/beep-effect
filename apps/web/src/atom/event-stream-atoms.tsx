import { $SharedClientId } from "@beep/identity/packages";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { prefixLogs } from "@beep/runtime-client/atom/utils";
import type { EventStreamEvents } from "@beep/shared-domain/rpc/v1/event-stream";
import { tagPropIs } from "@beep/utils";
import { Atom, type Registry, type Result } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { SharedRpcClient } from "./shared-rpc-client.ts";

const $I = $SharedClientId.create("atoms/event-stream-atoms");

export class EventStream extends Effect.Service<EventStream>()($I`EventStream`, {
  effect: Effect.gen(function* () {
    const pubSub = yield* PubSub.unbounded<EventStreamEvents.Type>();
    return {
      changes: Stream.fromPubSub(pubSub),
      publish: (event: EventStreamEvents.Type) => PubSub.publish(pubSub, event),
    };
  }),
}) {}

export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);
const layer = Layer.mergeAll(EventStream.Default, SharedRpcClient.Default);

const runtime = makeAtomRuntime(layer);

export const eventStreamAtom = runtime
  .atom(
    Effect.gen(function* () {
      const { rpc } = yield* SharedRpcClient;
      const eventStream = yield* EventStream;

      const source = yield* Effect.acquireRelease(
        rpc.eventStream_connect().pipe(Stream.flattenIterables, Stream.share({ capacity: "unbounded" })),
        () => Effect.logInfo("connection closed")
      );

      yield* Effect.logInfo("connection opened");

      const ka = source.pipe(
        Stream.filter((event) => tagPropIs(event, "Ka")),
        Stream.timeout("5 seconds")
      );

      const sync = source.pipe(
        Stream.filter((event) => tagPropIs(event, "Ka")),
        Stream.tap((event) => eventStream.publish(event))
      );

      return Stream.merge(ka, sync);
    }).pipe(Stream.unwrapScoped, Stream.retry(Schedule.spaced("1 seconds")))
  )
  .pipe(Atom.keepAlive);

export const makeEventStreamAtom = <A extends EventStreamEvents.Type, ER, R>(options: {
  readonly runtime: Atom.AtomRuntime<R | EventStream, ER>;
  readonly identifier: string;
  readonly predicate: (event: EventStreamEvents.Type) => event is A;
  readonly handler: (event: A) => Effect.Effect<void, unknown, NoInfer<R | Registry.AtomRegistry>>;
}): Atom.Atom<Result.Result<void, ER>> =>
  options.runtime
    .atom(
      Effect.gen(function* () {
        const eventStream = yield* EventStream;

        yield* Effect.acquireRelease(Effect.logInfo("acquired"), () => Effect.logInfo("released"));

        yield* eventStream.changes.pipe(
          Stream.filter(options.predicate),
          Stream.tap((event) => Effect.logInfo("event", event)),
          Stream.tap((event) => options.handler(event)),
          Stream.catchAllCause((cause) => Effect.logError(Cause.pretty(cause))),
          Stream.runDrain
        );
      }).pipe(prefixLogs("EventStream"))
    )
    .pipe(Atom.setIdleTTL(0));
