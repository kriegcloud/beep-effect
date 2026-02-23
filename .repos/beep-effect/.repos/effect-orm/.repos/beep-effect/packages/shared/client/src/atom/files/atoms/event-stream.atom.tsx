import { makeAtomRuntime } from "@beep/runtime-client";
import { prefixLogs } from "@beep/runtime-client/atom/utils";
import type { EventStreamEvents } from "@beep/shared-domain/rpc/v1/event-stream";
import { tagPropIs } from "@beep/utils";
import * as Thunk from "@beep/utils/thunk";
import { Atom, type Registry, type Result } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { FilesEventStream, FilesRpcClient } from "../../services";

const runtime = makeAtomRuntime(FilesEventStream.layer);

export const eventStreamAtom = runtime
  .atom(
    Effect.gen(function* () {
      const { rpc } = yield* FilesRpcClient.Service;
      const eventStream = yield* FilesEventStream.Service;

      const source = yield* Effect.acquireRelease(
        rpc.eventStream_connect().pipe(Stream.flattenIterables, Stream.share({ capacity: "unbounded" })),
        Thunk.thunkLogInfoEffect("connection closed")
      );

      yield* Effect.logInfo("connection opened");

      const ka = source.pipe(Stream.filter(tagPropIs("Ka")), Stream.timeout("5 seconds"));

      const sync = source.pipe(Stream.filter(tagPropIs("Ka")), Stream.tap(eventStream.publish));

      return Stream.merge(ka, sync);
    }).pipe(Stream.unwrapScoped, Stream.retry(Schedule.spaced("1 seconds")))
  )
  .pipe(Atom.keepAlive);

export const makeEventStreamAtom = <A extends EventStreamEvents.Type, ER, R>(options: {
  readonly runtime: Atom.AtomRuntime<R | FilesEventStream.Service, ER>;
  readonly identifier: string;
  readonly predicate: (event: EventStreamEvents.Type) => event is A;
  readonly handler: (event: A) => Effect.Effect<void, unknown, NoInfer<R | Registry.AtomRegistry>>;
}): Atom.Atom<Result.Result<void, ER>> =>
  options.runtime
    .atom(
      Effect.gen(function* () {
        const eventStream = yield* FilesEventStream.Service;

        yield* Effect.acquireRelease(Effect.logInfo("acquired"), Thunk.thunkLogInfoEffect("released"));

        yield* eventStream.changes.pipe(
          Stream.filter(options.predicate),
          Stream.tap((event) => Effect.logInfo("event", event)),
          Stream.tap(options.handler),
          Stream.catchAllCause((cause) => Effect.logError(Cause.pretty(cause))),
          Stream.runDrain
        );
      }).pipe(prefixLogs("EventStream"))
    )
    .pipe(Atom.setIdleTTL(0));
