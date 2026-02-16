import { makeAtomRuntime, prefixLogs } from "@/lib/atom";
import { DomainRpcClient } from "@/lib/domain-rpc-client";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { EventStreamEvents } from "@example/domain/api/event-stream-rpc";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";

export class EventStream extends Effect.Service<EventStream>()(
  "@example/client/services/atoms/event-stream-atoms/EventStream",
  {
    effect: Effect.gen(function* () {
      const pubSub = yield* PubSub.unbounded<EventStreamEvents>();
      return {
        changes: Stream.fromPubSub(pubSub),
        publish: (event: EventStreamEvents) => pubSub.publish(event),
      };
    }),
  },
) {}

const runtime = makeAtomRuntime(Layer.mergeAll(EventStream.Default, DomainRpcClient.Default));

export const eventStreamAtom = runtime
  .atom(
    Effect.gen(function* () {
      const rpc = yield* DomainRpcClient;
      const eventStream = yield* EventStream;

      const source = yield* Effect.acquireRelease(
        rpc
          .eventStream_connect()
          .pipe(Stream.flattenIterables, Stream.share({ capacity: "unbounded" })),
        () => Effect.logInfo("connection closed"),
      );

      yield* Effect.logInfo("connection opened");

      const ka = source.pipe(
        Stream.filter((event) => event._tag === "Ka"),
        Stream.timeout("5 seconds"),
      );

      const sync = source.pipe(
        Stream.filter((event) => event._tag !== "Ka"),
        Stream.tap((event) => eventStream.publish(event)),
      );

      return Stream.merge(ka, sync);
    }).pipe(Stream.unwrapScoped, Stream.retry(Schedule.spaced("1 seconds"))),
  )
  .pipe(Atom.keepAlive);

export const makeEventStreamAtom = <A extends EventStreamEvents, ER, R>(options: {
  readonly runtime: Atom.AtomRuntime<R | EventStream, ER>;
  readonly identifier: string;
  readonly predicate: (event: EventStreamEvents) => event is A;
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
          Stream.runDrain,
        );
      }).pipe(prefixLogs("EventStream")),
    )
    .pipe(Atom.setIdleTTL(0));
