/**
 * Schema-aware consumer that decodes messages at the NATS boundary.
 *
 * @module
 * @since 0.1.0
 */

import type { NatsMessage } from "@beep/beepgraph-messaging/NatsClient";
import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { Data, Effect, Schema, Stream } from "effect";

// ---------------------------------------------------------------------------
// JSON parsing via Schema
// ---------------------------------------------------------------------------

const jsonParse = Schema.decodeUnknownSync(Schema.UnknownFromJsonString);

// ---------------------------------------------------------------------------
// Decoded message wrapper
// ---------------------------------------------------------------------------

/**
 * A decoded inbound message together with the raw `NatsMessage`.
 *
 * @since 0.1.0
 * @category models
 */
export interface DecodedMessage<T> {
  readonly decoded: T;
  readonly raw: NatsMessage;
}

// ---------------------------------------------------------------------------
// Internal error tag
// ---------------------------------------------------------------------------

class ConsumerDecodeError extends Data.TaggedError("ConsumerDecodeError") {}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Subscribe to a topic and return a `Stream` of schema-decoded messages.
 *
 * Messages that fail decoding are logged, nak'd, and skipped.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeTypedConsumer = Effect.fn("makeTypedConsumer")(function* <T>(
  topic: string,
  group: string,
  decoder: Schema.Decoder<T>
) {
  const nats = yield* NatsClient;
  const decode = Schema.decodeUnknownSync(decoder);
  const rawStream = yield* nats.subscribe(topic, group);

  return rawStream.pipe(
    Stream.mapEffect((msg: NatsMessage) =>
      Effect.try({
        try: (): DecodedMessage<T> => {
          const text = new TextDecoder().decode(msg.data);
          const json: unknown = jsonParse(text);
          const decoded = decode(json);
          return { decoded, raw: msg };
        },
        catch: () => new ConsumerDecodeError(),
      }).pipe(
        Effect.catchTag("ConsumerDecodeError", () =>
          Effect.gen(function* () {
            yield* Effect.logWarning(`TypedConsumer(${topic}): decode failed`);
            yield* msg.nak();
            return yield* new ConsumerDecodeError();
          })
        )
      )
    ),
    Stream.catchTag("ConsumerDecodeError", () => Stream.empty)
  );
});
