/**
 * Schema-aware request/response client.
 *
 * Wraps `RequestResponse` from the messaging package with typed schemas.
 *
 * @module
 * @since 0.1.0
 */

import type {
  MessageParseError,
  MessageSendError,
  NatsConnectionError,
  NatsTimeout,
} from "@beep/graph-messaging/Errors";

import type { NatsClient } from "@beep/graph-messaging/NatsClient";
import { makeRequestResponse, RequestResponse } from "@beep/graph-messaging/RequestResponse";
import type { Schema } from "effect";
import { type Duration, Effect, type Layer, type Stream } from "effect";

// ---------------------------------------------------------------------------
// TypedRequestor interface
// ---------------------------------------------------------------------------

/**
 * A request/response client bound to typed schemas.
 *
 * @since 0.1.0
 * @category models
 */
export class TypedRequestor<_Req, Res> {
  declare readonly request: (
    payload: unknown,
    options?: { readonly timeout?: Duration.Duration }
  ) => Effect.Effect<Res, NatsTimeout | MessageParseError | MessageSendError>;

  declare readonly stream: (
    payload: unknown,
    options?: { readonly timeout?: Duration.Duration }
  ) => Stream.Stream<Res, NatsTimeout | MessageParseError | MessageSendError>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a typed request/response client for a specific topic pair.
 *
 * Returns a `Layer` for the underlying `RequestResponse` and a `use`
 * effect to obtain a `TypedRequestor` from it.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeTypedRequestor = <Req, Res>(
  requestTopic: string,
  responseTopic: string,
  consumerGroup: string,
  responseSchema: Schema.Decoder<Res>
): {
  readonly layer: Layer.Layer<RequestResponse, NatsConnectionError, NatsClient>;
  readonly use: Effect.Effect<TypedRequestor<Req, Res>, never, RequestResponse>;
} => {
  const rrLayer = makeRequestResponse(requestTopic, responseTopic, consumerGroup);

  const use: Effect.Effect<TypedRequestor<Req, Res>, never, RequestResponse> = Effect.gen(function* () {
    const rr = yield* RequestResponse;
    return {
      request: (payload, options) => rr.request(payload, responseSchema, options),
      stream: (payload, options) => rr.stream(payload, responseSchema, options),
    };
  });

  return { layer: rrLayer, use };
};
