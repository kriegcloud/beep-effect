/**
 * Effect-based request/response RPC primitive over NATS JetStream.
 *
 * Provides two calling modes:
 *
 * - **`request`** -- send a payload and await a single decoded response,
 *   matched by correlation ID via the `ResponseRouter`.
 * - **`stream`** -- send a payload and receive a `Stream` of decoded
 *   responses, automatically terminated when the responder signals
 *   end-of-stream.
 *
 * Both modes register with the `ResponseRouter` **before** publishing
 * the request message, which eliminates the race condition that plagued
 * the previous implementation (where the first response was returned
 * blindly and could be an empty explain event instead of the real
 * answer).
 *
 * A `makeRequestResponse` factory function parameterises the service
 * per topic pair, producing a `Layer` that can be composed into any
 * application graph.
 *
 * @example
 * ```typescript
 * import { Duration, Effect, Schema } from "effect"
 * import { RequestResponse, makeRequestResponse } from "@beep/beepgraph-messaging/RequestResponse"
 * import { NatsClient } from "@beep/beepgraph-messaging/NatsClient"
 * import { NatsConfig } from "@beep/beepgraph-messaging/NatsConfig"
 *
 * const MyResponse = Schema.Struct({ answer: Schema.String })
 *
 * const program = Effect.gen(function* () {
 *   const rpc = yield* RequestResponse
 *   const result = yield* rpc.request(
 *     { question: "What is Effect?" },
 *     MyResponse,
 *     { timeout: Duration.seconds(30) }
 *   )
 *   yield* Effect.log(`Answer: ${result.answer}`)
 * })
 *
 * const AppLayer = makeRequestResponse(
 *   "tg.flow.request",
 *   "tg.flow.response",
 *   "my-consumer-group"
 * )
 *
 * program.pipe(
 *   Effect.provide(AppLayer),
 *   Effect.provide(NatsClient.layer),
 *   Effect.provide(NatsConfig.layerLocal)
 * )
 * ```
 *
 * @since 0.0.0
 * @module @beep/beepgraph-messaging/RequestResponse
 */
import { type Cause, Context, Deferred, Duration, Effect, Layer, Queue, Schema, Stream } from "effect";
import { MessageParseError, type MessageSendError, type NatsConnectionError, NatsTimeout } from "./Errors.ts";
import { NatsClient } from "./NatsClient.ts";
import { makeResponseRouter, ResponseRouter } from "./ResponseRouter.ts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default timeout for single-response requests. */
const DEFAULT_TIMEOUT: Duration.Duration = Duration.seconds(300);

/** Default capacity for streaming response queues. */
const STREAM_QUEUE_CAPACITY = 256;

// ---------------------------------------------------------------------------
// End-of-stream detection
// ---------------------------------------------------------------------------

/**
 * Detect whether a decoded JSON payload represents an end-of-stream
 * signal from the responder. Checks for the most common sentinel
 * fields used across TrustGraph services.
 *
 * @internal
 */
const isEndOfStream = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.complete === true ||
    record.endOfStream === true ||
    record.end_of_stream === true ||
    record.end_of_dialog === true
  );
};

// ---------------------------------------------------------------------------
// JSON helpers (v4-compliant, no raw JSON.parse/JSON.stringify)
// ---------------------------------------------------------------------------

/**
 * Decode a string as JSON, producing `unknown`. Uses Effect Schema's
 * `UnknownFromJsonString` to comply with the `preferSchemaOverJson` rule.
 *
 * @internal
 */
const jsonParse = Schema.decodeUnknownSync(Schema.UnknownFromJsonString);

/**
 * Encode an unknown value as a JSON string. Uses Effect Schema's
 * `UnknownFromJsonString` (encode direction) to comply with
 * the `preferSchemaOverJson` rule.
 *
 * @internal
 */
const jsonStringify = Schema.encodeUnknownSync(Schema.UnknownFromJsonString);

// ---------------------------------------------------------------------------
// Service definition
// ---------------------------------------------------------------------------

/**
 * Two-method RPC primitive for request/response messaging over NATS.
 *
 * Each instance is scoped to a specific request/response topic pair and
 * uses the `ResponseRouter` for correlation.
 *
 * @since 0.0.0
 * @category models
 */
export class RequestResponse extends Context.Service<
  RequestResponse,
  {
    /**
     * Send a request and await a single decoded response.
     *
     * The implementation:
     * 1. Generates a UUID for correlation
     * 2. Creates a `Deferred`
     * 3. Registers with `ResponseRouter` **before** publishing (prevents
     *    the race condition from the old implementation)
     * 4. Publishes the request via `NatsClient`
     * 5. Awaits the `Deferred` with a configurable timeout
     * 6. Decodes the raw response bytes through the provided `Schema`
     * 7. Cleans up the registration via `Effect.ensuring`
     *
     * @param payload - The request body (will be JSON-serialised).
     * @param responseSchema - An Effect `Schema` used to decode and
     *   validate the response payload.
     * @param options - Optional configuration.
     * @param options.timeout - Maximum time to wait for the response.
     *   Defaults to 300 seconds.
     */
    readonly request: <A>(
      payload: unknown,
      responseSchema: Schema.Decoder<A>,
      options?: { readonly timeout?: Duration.Duration }
    ) => Effect.Effect<A, NatsTimeout | MessageParseError | MessageSendError>;

    /**
     * Send a request and return a `Stream` of decoded responses.
     *
     * The stream terminates when the responder sends an end-of-stream
     * marker (an object with `complete`, `endOfStream`, `end_of_stream`,
     * or `end_of_dialog` set to `true`).
     *
     * The implementation:
     * 1. Generates a UUID for correlation
     * 2. Creates a bounded `Queue`
     * 3. Registers the queue with `ResponseRouter` **before** publishing
     * 4. Publishes the request via `NatsClient`
     * 5. Returns `Stream.fromQueue` that decodes each element via the
     *    provided `Schema` and terminates on end-of-stream markers
     * 6. `Stream.ensuring` handles cleanup of the registration
     *
     * @param payload - The request body (will be JSON-serialised).
     * @param responseSchema - An Effect `Schema` used to decode each
     *   streamed response element.
     * @param options - Optional configuration.
     * @param options.timeout - Maximum time to wait for the **first**
     *   response element. Defaults to 300 seconds. Subsequent elements
     *   inherit the same per-element timeout.
     */
    readonly stream: <A>(
      payload: unknown,
      responseSchema: Schema.Decoder<A>,
      options?: { readonly timeout?: Duration.Duration }
    ) => Stream.Stream<A, NatsTimeout | MessageParseError | MessageSendError>;
  }
>()("@beep/beepgraph-messaging/RequestResponse") {}

// ---------------------------------------------------------------------------
// Internal: response decoding
// ---------------------------------------------------------------------------

/**
 * Decode raw response bytes through JSON parsing and Schema validation.
 * Uses `Schema.fromJsonString` to compose JSON parsing with the user's
 * response schema in a single decode step.
 *
 * @internal
 */
const decodeResponse = <A>(
  rawBytes: Uint8Array,
  schema: Schema.Decoder<A>,
  topic: string
): Effect.Effect<A, MessageParseError> => {
  const text = new TextDecoder().decode(rawBytes);
  const decoder = Schema.decodeUnknownEffect(Schema.fromJsonString(schema));
  return decoder(text).pipe(
    Effect.mapError(
      () =>
        new MessageParseError({
          topic,
          raw: text,
        })
    )
  );
};

// ---------------------------------------------------------------------------
// Layer factory
// ---------------------------------------------------------------------------

/**
 * Create a `Layer` that provides a `RequestResponse` service scoped to
 * the given request/response topic pair.
 *
 * Internally constructs a `ResponseRouter` for the response topic and
 * wires it into the `RequestResponse` implementation.
 *
 * @param requestTopic - The NATS subject to publish requests on.
 * @param responseTopic - The NATS subject to subscribe to for
 *   correlated responses.
 * @param consumerGroup - The durable consumer group name for the
 *   response subscription.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeRequestResponse = (
  requestTopic: string,
  responseTopic: string,
  consumerGroup: string
): Layer.Layer<RequestResponse, NatsConnectionError, NatsClient> => {
  // Build the ResponseRouter layer for this topic pair
  const RouterLayer = makeResponseRouter(responseTopic, `${consumerGroup}-rr`);

  // Build the RequestResponse layer that depends on ResponseRouter + NatsClient
  const RequestResponseLayer = Layer.effect(
    RequestResponse,
    Effect.gen(function* () {
      const nats = yield* NatsClient;
      const router = yield* ResponseRouter;

      // -----------------------------------------------------------------------
      // Shared: serialise payload to bytes
      // -----------------------------------------------------------------------
      const encodePayload = (payload: unknown): Uint8Array => {
        const text = jsonStringify(payload);
        return new TextEncoder().encode(text);
      };

      // -----------------------------------------------------------------------
      // request: single-response RPC
      // -----------------------------------------------------------------------
      const request = <A>(
        payload: unknown,
        responseSchema: Schema.Decoder<A>,
        options?: { readonly timeout?: Duration.Duration }
      ): Effect.Effect<A, NatsTimeout | MessageParseError | MessageSendError> =>
        Effect.gen(function* () {
          const id = crypto.randomUUID();
          const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
          const timeoutMs = Duration.toMillis(timeout);

          // 1. Create Deferred for the response
          const deferred = yield* Deferred.make<Uint8Array, NatsTimeout>();

          // 2. Register BEFORE publishing (prevents race condition)
          yield* router.register(id, deferred);

          // 3. Publish request with correlation ID header
          const requestBytes = encodePayload(payload);
          yield* nats.publish(requestTopic, requestBytes, {
            "Nats-Msg-Id": id,
          });

          // 4. Await response with timeout, ensuring cleanup
          const rawBytes = yield* Deferred.await(deferred).pipe(
            Effect.timeout(timeout),
            Effect.catchTag("TimeoutError", () =>
              Effect.fail(
                new NatsTimeout({
                  topic: responseTopic,
                  requestId: id,
                  durationMs: timeoutMs,
                })
              )
            ),
            Effect.ensuring(router.unregister(id))
          );

          // 5. Decode the response
          const decoded = yield* decodeResponse(rawBytes, responseSchema, responseTopic);

          return decoded;
        }).pipe(
          Effect.withSpan("RequestResponse.request", {
            attributes: { requestTopic, responseTopic },
          })
        );

      // -----------------------------------------------------------------------
      // stream: multi-response streaming RPC
      // -----------------------------------------------------------------------
      const stream = <A>(
        payload: unknown,
        responseSchema: Schema.Decoder<A>,
        options?: { readonly timeout?: Duration.Duration }
      ): Stream.Stream<A, NatsTimeout | MessageParseError | MessageSendError> => {
        const id = crypto.randomUUID();
        const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

        return Stream.unwrap(
          Effect.gen(function* () {
            // 1. Create bounded queue for response chunks
            const queue = yield* Queue.make<Uint8Array, Cause.Done>({
              capacity: STREAM_QUEUE_CAPACITY,
            });

            // 2. Register stream BEFORE publishing (prevents race condition)
            yield* router.registerStream(id, queue);

            // 3. Publish request with correlation ID header
            const requestBytes = encodePayload(payload);
            yield* nats.publish(requestTopic, requestBytes, {
              "Nats-Msg-Id": id,
            });

            // 4. Build the stream from the queue.
            //    First step: parse raw bytes to JSON.
            //    Second step: takeWhile to terminate at EOS.
            //    Third step: decode through user schema.
            const decoder = Schema.decodeUnknownEffect(responseSchema);

            const responseStream: Stream.Stream<A, NatsTimeout | MessageParseError | MessageSendError> =
              Stream.fromQueue(queue).pipe(
                // Parse raw bytes -> JSON (unknown)
                Stream.mapEffect((rawBytes) => {
                  const text = new TextDecoder().decode(rawBytes);
                  return Effect.try({
                    try: () => jsonParse(text),
                    catch: () =>
                      new MessageParseError({
                        topic: responseTopic,
                        raw: text,
                      }),
                  });
                }),
                // Terminate when we see an end-of-stream marker.
                // The EOS marker itself is NOT emitted downstream.
                Stream.takeWhile((json) => !isEndOfStream(json)),
                // Decode each JSON element through the user's schema
                Stream.mapEffect((json) =>
                  decoder(json).pipe(
                    Effect.mapError(
                      () =>
                        new MessageParseError({
                          topic: responseTopic,
                          raw: json,
                        })
                    ),
                    Effect.timeout(timeout),
                    Effect.catchTag("TimeoutError", () =>
                      Effect.fail(
                        new NatsTimeout({
                          topic: responseTopic,
                          requestId: id,
                          durationMs: Duration.toMillis(timeout),
                        })
                      )
                    )
                  )
                ),
                // Cleanup when stream ends (success, error, or interruption)
                Stream.ensuring(router.unregister(id))
              );

            return responseStream;
          })
        );
      };

      return RequestResponse.of({
        request,
        stream,
      });
    })
  );

  return RequestResponseLayer.pipe(Layer.provide(RouterLayer));
};
