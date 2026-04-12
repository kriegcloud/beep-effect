import type { NatsTimeout } from "@beep/beepgraph-messaging/Errors";
import type { NatsMessage } from "@beep/beepgraph-messaging/NatsClient";
import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { makeResponseRouter, ResponseRouter } from "@beep/beepgraph-messaging/ResponseRouter";
import { describe, expect, it } from "@effect/vitest";
import { type Cause, Deferred, Effect, Layer, Queue, Stream } from "effect";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockMessage = (opts: { data?: Uint8Array; subject?: string; id?: string }): NatsMessage => ({
  data: opts.data ?? new Uint8Array(0),
  subject: opts.subject ?? "test.response",
  headers: {},
  properties: opts.id !== undefined ? { id: opts.id } : {},
  ack: () => Effect.void,
  nak: () => Effect.void,
});

/**
 * Create a mock NatsClient whose subscribe returns a Queue-backed stream.
 * The returned queue lets us push messages AFTER the router has started.
 */
const makeMockNatsWithQueue = () =>
  Effect.gen(function* () {
    const q = yield* Queue.make<NatsMessage>({ capacity: 64 });
    const stream = Stream.fromQueue(q);
    const natsLayer = Layer.succeed(NatsClient)(
      NatsClient.of({
        publish: () => Effect.void,
        subscribe: () => Effect.succeed(stream),
        // biome-ignore lint/suspicious/noExplicitAny: test mock — jetstream not used
        jetstream: undefined as any,
      })
    );
    return { queue: q, natsLayer };
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ResponseRouter", () => {
  it.effect("dispatches a message to a registered Deferred by id", () =>
    Effect.gen(function* () {
      const { queue: msgQueue, natsLayer } = yield* makeMockNatsWithQueue();
      const RouterLayer = makeResponseRouter("test.response", "test-group");

      const result = yield* Effect.gen(function* () {
        const router = yield* ResponseRouter;

        // Register BEFORE sending message
        const deferred = yield* Deferred.make<Uint8Array, NatsTimeout>();
        yield* router.register("req-1", deferred);

        // Now push a message — the background fiber will dispatch it
        const payload = new TextEncoder().encode("hello");
        yield* Queue.offer(msgQueue, mockMessage({ id: "req-1", data: payload }));

        const value = yield* Deferred.await(deferred);
        return value;
      }).pipe(Effect.provide(RouterLayer), Effect.provide(natsLayer), Effect.scoped);

      expect(new TextDecoder().decode(result)).toBe("hello");
    })
  );

  it.effect("dispatches a message to a registered stream Queue by id", () =>
    Effect.gen(function* () {
      const { queue: msgQueue, natsLayer } = yield* makeMockNatsWithQueue();
      const RouterLayer = makeResponseRouter("test.response", "test-group");

      const result = yield* Effect.gen(function* () {
        const router = yield* ResponseRouter;

        const dataQueue = yield* Queue.make<Uint8Array, Cause.Done>({ capacity: 16 });
        yield* router.registerStream("stream-1", dataQueue);

        const payload = new TextEncoder().encode("chunk-1");
        yield* Queue.offer(msgQueue, mockMessage({ id: "stream-1", data: payload }));

        const value = yield* Queue.take(dataQueue);
        return value;
      }).pipe(Effect.provide(RouterLayer), Effect.provide(natsLayer), Effect.scoped);

      expect(new TextDecoder().decode(result)).toBe("chunk-1");
    })
  );

  it.effect("drops messages with no id without crashing the dispatch loop", () =>
    Effect.gen(function* () {
      const { queue: msgQueue, natsLayer } = yield* makeMockNatsWithQueue();
      const RouterLayer = makeResponseRouter("test.response", "test-group");

      const result = yield* Effect.gen(function* () {
        const router = yield* ResponseRouter;

        // Register a deferred for a known id
        const deferred = yield* Deferred.make<Uint8Array, NatsTimeout>();
        yield* router.register("after-orphan", deferred);

        // Push an orphan (no id) first — should be silently dropped
        yield* Queue.offer(msgQueue, mockMessage({ data: new TextEncoder().encode("orphan") }));

        // Then push a real message — if the dispatch loop survived, this will resolve
        const payload = new TextEncoder().encode("alive");
        yield* Queue.offer(msgQueue, mockMessage({ id: "after-orphan", data: payload }));

        return yield* Deferred.await(deferred);
      }).pipe(Effect.provide(RouterLayer), Effect.provide(natsLayer), Effect.scoped);

      expect(new TextDecoder().decode(result)).toBe("alive");
    })
  );

  it.effect("unregister removes deferred and signals stream Queue end", () =>
    Effect.gen(function* () {
      const { natsLayer } = yield* makeMockNatsWithQueue();
      const RouterLayer = makeResponseRouter("test.response", "test-group");

      yield* Effect.gen(function* () {
        const router = yield* ResponseRouter;

        // Register a stream queue, then unregister it
        const dataQueue = yield* Queue.make<Uint8Array, Cause.Done>({ capacity: 16 });
        yield* router.registerStream("cleanup-1", dataQueue);
        yield* router.unregister("cleanup-1");

        // After unregister, Queue.end was called. Consuming from the
        // queue should yield an empty stream (end-of-stream).
        const items = yield* Stream.fromQueue(dataQueue).pipe(Stream.runCollect);
        expect(Array.from(items)).toEqual([]);
      }).pipe(Effect.provide(RouterLayer), Effect.provide(natsLayer), Effect.scoped);
    })
  );
});
