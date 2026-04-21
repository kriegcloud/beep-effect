/**
 * Background service that correlates NATS response messages to pending
 * requests by their unique correlation ID.
 *
 * The `ResponseRouter` subscribes to a shared response topic, maintains
 * registries of pending single-response (`Deferred`) and streaming
 * (`Queue`) requests, and dispatches each inbound message to the correct
 * consumer based on the `id` property carried in message headers.
 *
 * This design eliminates the race condition present in the old
 * request-response implementation by ensuring registrations happen
 * **before** the request is published, and matching is performed by
 * correlation ID rather than returning the first message blindly.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { ResponseRouter } from "@beep/graph-messaging/ResponseRouter"
 *
 * const program = Effect.gen(function* () {
 *   const router = yield* ResponseRouter
 *   // Registration/deregistration is handled internally by RequestResponse
 * })
 * ```
 *
 * @since 0.0.0
 * @module @beep/graph-messaging/ResponseRouter
 */
import { type Cause, Context, Deferred, Effect, HashMap, Layer, Queue, Ref, Stream } from "effect";
import type { NatsConnectionError, NatsTimeout } from "./Errors.ts";
import type { NatsMessage } from "./NatsClient.ts";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { NatsClient } from "./NatsClient.ts";
import { dual } from "effect/Function";
import { $GraphMessagingId } from "@beep/identity";

const $I = $GraphMessagingId.create("ResponseRouter");

// ---------------------------------------------------------------------------
// Service definition
// ---------------------------------------------------------------------------

/**
 * Correlates inbound response messages to pending requests by ID.
 *
 * The router maintains two registries:
 * - A `Deferred` registry for single-response requests
 * - A `Queue` registry for streaming requests
 *
 * Each registry is keyed by the unique correlation ID that was attached
 * to the outbound request message.
 *
 * @since 0.0.0
 * @category models
 */
export class ResponseRouter extends Context.Service<
  ResponseRouter,
  {
    /**
     * Register a `Deferred` for a single-response request.
     *
     * Must be called **before** publishing the request to prevent the
     * response from arriving before the deferred is registered.
     *
     * @param id - Unique correlation ID for the request.
     * @param deferred - The `Deferred` that will be completed when the
     *   matching response arrives.
     */
    readonly register: (id: string, deferred: Deferred.Deferred<Uint8Array, NatsTimeout>) => Effect.Effect<void>;

    /**
     * Register a `Queue` for a streaming request.
     *
     * Must be called **before** publishing the request to prevent early
     * responses from being lost.
     *
     * @param id - Unique correlation ID for the request.
     * @param queue - The bounded `Queue` that will receive each response
     *   chunk as it arrives.
     */
    readonly registerStream: (id: string, queue: Queue.Queue<Uint8Array, Cause.Done>) => Effect.Effect<void>;

    /**
     * Remove the registration for the given correlation ID.
     *
     * Called during cleanup (via `Effect.ensuring`) after the response
     * has been received or the operation times out.
     *
     * @param id - The correlation ID to unregister.
     */
    readonly unregister: (id: string) => Effect.Effect<void>;
  }
>()($I`ResponseRouter`) {}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** @internal */
type DeferredRegistry = HashMap.HashMap<string, Deferred.Deferred<Uint8Array, NatsTimeout>>;

/** @internal */
type StreamRegistry = HashMap.HashMap<string, Queue.Queue<Uint8Array, Cause.Done>>;

// ---------------------------------------------------------------------------
// Internal: message dispatching
// ---------------------------------------------------------------------------

/**
 * Process a single inbound message by looking up its correlation ID in
 * both registries. If a matching `Deferred` is found it is completed;
 * if a matching `Queue` is found the payload is offered to it.
 *
 * Messages without a recognizable `id` property are silently dropped
 * (they may be heartbeats or control messages from the broker).
 *
 * @internal
 */

const dispatchMessage: {
  (
  msg: NatsMessage,
  deferredRef: Ref.Ref<DeferredRegistry>,
  streamRef: Ref.Ref<StreamRegistry>,
): Effect.Effect<void>
  (
  deferredRef: Ref.Ref<DeferredRegistry>,
  streamRef: Ref.Ref<StreamRegistry>
): (msg: NatsMessage) => Effect.Effect<void>
} = dual(3, Effect.fn("ResponseRouter.dispatchMessage")(function* (
  msg: NatsMessage,
  deferredRef: Ref.Ref<DeferredRegistry>,
  streamRef: Ref.Ref<StreamRegistry>
): Effect.fn.Return<void>  {
  // Acknowledge receipt regardless of whether we can match it
  yield* msg.ack();

  const id = msg.properties.id;
  if (P.isUndefined(id)) {
    yield* Effect.logDebug("ResponseRouter: dropping message with no correlation id");
    return;
  }

  // Check single-response registry first
  const pendingMap = yield* Ref.get(deferredRef);
  const maybePending = HashMap.get(pendingMap, id);

  if (O.isSome(maybePending)) {
    yield* Deferred.succeed(maybePending.value, msg.data);
    // Remove eagerly — the requester's ensuring(unregister) will
    // be a no-op, but we prevent stale entries from accumulating
    // between dispatch and the requester's cleanup.
    yield* Ref.update(deferredRef, HashMap.remove(id));
    return;
  }

  // Check streaming registry
  const streamMap = yield* Ref.get(streamRef);
  const maybeStream = HashMap.get(streamMap, id);

  if (O.isSome(maybeStream)) {
    // Ignore offer failure — the queue may have been shut down if
    // the consumer disconnected. Dropping the message is safe; the
    // important thing is that the dispatch loop stays alive.
    yield* Queue.offer(maybeStream.value, msg.data).pipe(Effect.ignore);
    return;
  }

  yield* Effect.logDebug(`ResponseRouter: no pending request for id="${id}", dropping`);
}))

// ---------------------------------------------------------------------------
// Layer factory
// ---------------------------------------------------------------------------

/**
 * Create a scoped `Layer` that provides a `ResponseRouter` for the given
 * response topic and consumer group.
 *
 * The layer subscribes to the response topic via `NatsClient.subscribe`
 * and forks a background fiber that continuously dispatches inbound
 * messages to the correct pending request.
 *
 * The background fiber is interrupt-safe: it will be cleaned up
 * automatically when the enclosing scope closes.
 *
 * @param responseTopic - The NATS subject to subscribe to for responses.
 * @param consumerGroup - The durable consumer group name for the
 *   subscription.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeResponseRouter = (
  responseTopic: string,
  consumerGroup: string
): Layer.Layer<ResponseRouter, NatsConnectionError, NatsClient> =>
  Layer.effect(
    ResponseRouter,
    Effect.gen(function* () {
      const nats = yield* NatsClient;

      // -- Registries --
      const deferredRef = yield* Ref.make<DeferredRegistry>(HashMap.empty());
      const streamRef = yield* Ref.make<StreamRegistry>(HashMap.empty());

      // -- Subscribe to the response topic --
      const messages = yield* nats.subscribe(responseTopic, consumerGroup);

      // -- Fork a background fiber to dispatch messages --
      yield* messages.pipe(
        Stream.runForEach(dispatchMessage( deferredRef, streamRef)),
        Effect.onInterrupt(() => Effect.logInfo(`ResponseRouter: shutting down subscription on "${responseTopic}"`)),
        Effect.forkScoped
      );

      yield* Effect.logInfo(`ResponseRouter: listening on "${responseTopic}" (group=${consumerGroup})`);

      // -- Build service methods --

      const register = Effect.fn("ResponseRouter.register")(function* (
        id: string,
        deferred: Deferred.Deferred<Uint8Array, NatsTimeout>
      ) {
        yield* Ref.update(deferredRef, HashMap.set(id, deferred));
        yield* Effect.logDebug(`ResponseRouter: registered deferred id="${id}"`);
      });

      const registerStream = Effect.fn("ResponseRouter.registerStream")(function* (
        id: string,
        queue: Queue.Queue<Uint8Array, Cause.Done>
      ) {
        yield* Ref.update(streamRef, HashMap.set(id, queue));
        yield* Effect.logDebug(`ResponseRouter: registered stream id="${id}"`);
      });

      const unregister = Effect.fn("ResponseRouter.unregister")(function* (id: string) {
        yield* Ref.update(deferredRef, HashMap.remove(id));

        // If it was a streaming registration, signal end-of-stream to the queue
        const streamMap = yield* Ref.get(streamRef);
        const maybeQueue = HashMap.get(streamMap, id);
        if (O.isSome(maybeQueue)) {
          yield* Queue.end(maybeQueue.value);
        }
        yield* Ref.update(streamRef, HashMap.remove(id));

        yield* Effect.logDebug(`ResponseRouter: unregistered id="${id}"`);
      });

      return ResponseRouter.of({
        register,
        registerStream,
        unregister,
      });
    })
  );
