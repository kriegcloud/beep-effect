/**
 * Effect-wrapped NATS JetStream client providing publish/subscribe
 * with durable consumers, automatic lifecycle management, and typed
 * error handling.
 *
 * The service connects to a NATS server, initializes JetStream, and
 * exposes an effectful API for durable pub/sub over JetStream subjects.
 *
 * @example
 * ```typescript
 * import { Effect, Stream } from "effect"
 * import { NatsClient } from "@beep/graph-messaging/NatsClient"
 * import { NatsConfig } from "@beep/graph-messaging/NatsConfig"
 *
 * const program = Effect.gen(function* () {
 *   const nats = yield* NatsClient
 *
 *   // Publish a message
 *   yield* nats.publish("tg.flow.request", new TextEncoder().encode("hello"))
 *
 *   // Subscribe and process messages
 *   const messages = yield* nats.subscribe("tg.flow.request", "my-consumer")
 *   yield* messages.pipe(
 *     Stream.take(5),
 *     Stream.runForEach((msg) =>
 *       Effect.gen(function* () {
 *         yield* Effect.log(`Received on ${msg.subject}: ${msg.data.length} bytes`)
 *         yield* msg.ack()
 *       })
 *     )
 *   )
 * })
 *
 * const runnable = program.pipe(
 *   Effect.provide(NatsClient.layer),
 *   Effect.provide(NatsConfig.layerLocal)
 * )
 * ```
 *
 * @since 0.0.0
 * @module @beep/graph-messaging/NatsClient
 */
import {thunkVoid} from "@beep/utils";
import {Context, Effect, Layer, Queue, Stream} from "effect";
import {
  AckPolicy,
  connect,
  type Consumer as NatsJsConsumer,
  DeliverPolicy,
  headers as natsHeaders,
  type JetStreamClient,
  type JetStreamManager,
  type NatsConnection,
} from "nats";
import {MessageSendError, NatsConnectionError} from "./Errors.ts";
import {NatsConfig} from "./NatsConfig.ts";
import { $GraphMessagingId } from "@beep/identity";

const $I = $GraphMessagingId.create("NatsClient")

// ---------------------------------------------------------------------------
// NatsMessage
// ---------------------------------------------------------------------------

/**
 * An inbound message received from a NATS JetStream consumer.
 *
 * Wraps the raw JetStream message with an Effect-native acknowledge/
 * negative-acknowledge API and pre-parsed headers.
 *
 * @since 0.0.0
 * @category models
 */
export class NatsMessage {
  /**
   * Acknowledge successful processing of the message.
   *
   * The server will not redeliver this message to the same consumer group.
   */
  declare readonly ack: () => Effect.Effect<void>;
  /** Raw payload bytes. */
  declare readonly data: Uint8Array;
  /** Parsed NATS headers as a flat key-value map. */
  declare readonly headers: Record<string, string>;
  /**
   * Negative-acknowledge the message, requesting redelivery.
   *
   * @param delayMs - Optional delay in milliseconds before the message is
   *   redelivered. When omitted the server applies its default backoff.
   */
  declare readonly nak: (delayMs?: number) => Effect.Effect<void>;
  /** Message properties (includes `"id"` from the `Nats-Msg-Id` header when present). */
  declare readonly properties: Record<string, string>;
  /** The NATS subject the message was published to. */
  declare readonly subject: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derive a JetStream stream name from a dotted subject.
 *
 * Takes the first two segments and joins them with an underscore.
 *
 * @example
 * ```
 * streamNameFromSubject("tg.flow.config-request") // "tg_flow"
 * ```
 *
 * @internal
 */
const streamNameFromSubject = (subject: string): string => {
  const parts = subject.split(".");
  const first = parts[0] ?? subject;
  const second = parts[1];
  return second !== undefined ? `${first}_${second}` : first;
};

/**
 * Build a wildcard subject for the stream from the first two dotted
 * segments. E.g. `"tg.flow.config-request"` becomes `"tg.flow.>"`.
 *
 * @internal
 */
const wildcardSubjectFromSubject = (subject: string): string => {
  const parts = subject.split(".");
  const first = parts[0] ?? subject;
  const second = parts[1];
  return second !== undefined ? `${first}.${second}.>` : `${first}.>`;
};

/**
 * Ensure the JetStream stream backing the given subject exists. Creates
 * the stream with a wildcard filter when it does not yet exist.
 *
 * @internal
 */
const ensureStream = Effect.fn("NatsClient.ensureStream")(function* (
  jsm: JetStreamManager,
  subject: string
): Effect.fn.Return<string, NatsConnectionError> {
  const streamName = streamNameFromSubject(subject);
  const wildcardSubject = wildcardSubjectFromSubject(subject);

  yield* Effect.tryPromise({
    try: async () => {
      try {
        await jsm.streams.info(streamName);
      } catch {
        await jsm.streams.add({
          name: streamName,
          subjects: [wildcardSubject],
        });
      }
    },
    catch: (cause) =>
      new NatsConnectionError({
        url: "n/a",
        cause: `Failed to ensure JetStream stream "${streamName}": ${String(cause)}`,
      }),
  });

  return streamName;
});

/**
 * Ensure a durable pull consumer exists on the given stream and return
 * a handle to it.
 *
 * @internal
 */
const ensureConsumer = Effect.fn("NatsClient.ensureConsumer")(function* (
  js: JetStreamClient,
  jsm: JetStreamManager,
  streamName: string,
  subject: string,
  durableName: string
): Effect.fn.Return<NatsJsConsumer, NatsConnectionError> {
  // Try to get an existing consumer first; create if it does not exist.
  return yield * Effect.tryPromise({
    try: async () => {
      try {
        return await js.consumers.get(streamName, durableName);
      } catch {
        await jsm.consumers.add(streamName, {
          durable_name: durableName,
          ack_policy: AckPolicy.Explicit,
          deliver_policy: DeliverPolicy.New,
          filter_subject: subject,
        });
        return await js.consumers.get(streamName, durableName);
      }
    },
    catch: (cause) => new NatsConnectionError({
      url: "n/a",
      cause: `Failed to ensure consumer "${durableName}" on stream "${streamName}": ${String(
        cause)}`,
    }),
  });
});

// ---------------------------------------------------------------------------
// NatsClient service
// ---------------------------------------------------------------------------

/**
 * Core NATS messaging service wrapping the `nats` npm package with
 * Effect lifecycle management.
 *
 * All interactions with the NATS server -- publishing, subscribing,
 * and stream management -- are modelled as `Effect` values with typed
 * errors and automatic resource cleanup.
 *
 * @since 0.0.0
 * @category models
 */
export class NatsClient extends Context.Service<
  NatsClient,
  {
    /**
     * Publish a message to a JetStream subject.
     *
     * The message is durably persisted by JetStream before the returned
     * effect completes.
     *
     * @param topic - The dotted NATS subject (e.g. `"tg.flow.request"`).
     * @param data - The raw payload bytes.
     * @param headers - Optional key-value headers attached to the message.
     */
    publish(topic: string, data: Uint8Array, headers?: Record<string, string>): Effect.Effect<void, MessageSendError>;

    /**
     * Subscribe to a JetStream subject as an Effect `Stream`.
     *
     * Creates (or binds to) a durable pull consumer identified by `group`
     * and emits `NatsMessage` elements. The subscription is cleaned up
     * when the enclosing scope closes.
     *
     * @param topic - The dotted NATS subject to subscribe to.
     * @param group - Durable consumer name; consumers sharing the same
     *   group load-balance messages among themselves.
     */
    subscribe(
      topic: string,
      group: string
    ): Effect.Effect<Stream.Stream<NatsMessage, NatsConnectionError>, NatsConnectionError>;

    /** The underlying JetStream manager for advanced stream administration. */
    readonly jetstream: JetStreamManager;
  }
>()($I`NatsClient`) {
  // -------------------------------------------------------------------------
  // Layer
  // -------------------------------------------------------------------------

  /**
   * Scoped layer that connects to NATS, initializes JetStream, and
   * provides the `NatsClient` service.
   *
   * The NATS connection is drained (gracefully closed) when the layer
   * scope is finalized.
   *
   * @since 0.0.0
   * @category layers
   */
  static readonly layer: Layer.Layer<NatsClient, NatsConnectionError, NatsConfig> = Layer.effect(
    NatsClient,
    Effect.gen(function* () {
      const config = yield* NatsConfig;

      // -- 1. Connect to NATS with acquireRelease for lifecycle management --
      const nc: NatsConnection = yield* Effect.acquireRelease(
        Effect.tryPromise({
          try: () =>
            connect({
              servers: config.url,
              maxReconnectAttempts: config.maxReconnects,
              reconnectTimeWait: config.reconnectDelayMs,
            }),
          catch: (cause) =>
            new NatsConnectionError({
              url: config.url,
              cause: `Initial connection failed: ${String(cause)}`,
            }),
        }),
        (conn) =>
          Effect.promise(async () => {
            // Drain can throw if the connection is already closed.
            // Release finalizers must never fail, so catch and discard.
            await conn.drain().catch(thunkVoid);
          })
      );

      yield* Effect.logInfo(`Connected to NATS at ${config.url}`);

      // -- 2. Obtain JetStream client and manager --
      const js: JetStreamClient = nc.jetstream();
      const jsm: JetStreamManager = yield* Effect.tryPromise({
        try: () => nc.jetstreamManager(),
        catch: (cause) =>
          new NatsConnectionError({
            url: config.url,
            cause: `Failed to obtain JetStream manager: ${String(cause)}`,
          }),
      });

      // -- 3. Build service methods --

      const publish = Effect.fn("NatsClient.publish")(function* (
        topic: string,
        data: Uint8Array,
        msgHeaders?: Record<string, string>
      ): Effect.fn.Return<void, MessageSendError> {
        // Ensure the backing stream exists before publishing
        yield* ensureStream(jsm, topic).pipe(
          Effect.mapError((err) => new MessageSendError({ topic, cause: err.cause }))
        );

        yield* Effect.tryPromise({
          try: () => {
            if (msgHeaders !== undefined && Object.keys(msgHeaders).length > 0) {
              const h = natsHeaders();
              for (const [key, val] of Object.entries(msgHeaders)) {
                h.append(key, val);
              }
              return js.publish(topic, data, { headers: h });
            }
            return js.publish(topic, data);
          },
          catch: (cause) =>
            new MessageSendError({
              topic,
              cause: `JetStream publish failed: ${String(cause)}`,
            }),
        });
      });

      const subscribe = Effect.fn("NatsClient.subscribe")(function* (
        topic: string,
        group: string
      ): Effect.fn.Return<Stream.Stream<NatsMessage, NatsConnectionError>, NatsConnectionError> {
        const streamName = yield* ensureStream(jsm, topic);
        const consumer = yield* ensureConsumer(js, jsm, streamName, topic, group);

        // Build a Stream using Stream.callback -- the v4 pattern for
        // callback-based / pull-based sources. The callback effect runs
        // concurrently with the stream consumer. When it errors, the
        // stream emits that error. When interrupted (scope closes), the
        // loop stops cleanly.
        const messageStream: Stream.Stream<NatsMessage, NatsConnectionError> = Stream.callback<
          NatsMessage,
          NatsConnectionError
        >((queue) =>
          Effect.gen(function* () {
            // Run the poll loop directly (not forked) so errors
            // propagate to the stream and Queue.offer provides
            // backpressure when the consumer can't keep up.
            while (true) {
              const msg = yield* Effect.tryPromise({
                try: () => consumer.next({ expires: 5_000 }),
                catch: (cause) =>
                  new NatsConnectionError({
                    url: config.url,
                    cause: `Consumer pull failed: ${String(cause)}`,
                  }),
              });

              if (msg !== null) {
                // Parse headers into a flat record
                const parsedHeaders: Record<string, string> = {};
                const rawHeaders = msg.headers;
                if (rawHeaders !== undefined) {
                  for (const [key, values] of rawHeaders) {
                    const first = values[0];
                    if (first !== undefined) {
                      parsedHeaders[key] = first;
                    }
                  }
                }

                // Build properties map (includes message ID when present)
                const props: Record<string, string> & { id?: string } = { ...parsedHeaders };
                const msgId = parsedHeaders["Nats-Msg-Id"];
                if (msgId !== undefined) {
                  props.id = msgId;
                }

                const natsMessage: NatsMessage = {
                  data: msg.data,
                  subject: msg.subject,
                  headers: parsedHeaders,
                  properties: props,
                  ack: () => Effect.sync(() => msg.ack()),
                  nak: (delayMs?: number) =>
                    Effect.sync(() => {
                      if (delayMs !== undefined) {
                        msg.nak(delayMs);
                      } else {
                        msg.nak();
                      }
                    }),
                };

                // Queue.offer awaits space — provides backpressure
                yield* Queue.offer(queue, natsMessage);
              } else {
                // No message within the poll window — yield to let
                // other fibers run before polling again
                yield* Effect.yieldNow;
              }
            }
          })
        );

        return messageStream;
      });

      // -- 4. Return the service implementation --
      return NatsClient.of({
        publish,
        subscribe,
        jetstream: jsm,
      });
    })
  );
}
