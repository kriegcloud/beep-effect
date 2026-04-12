/**
 * Schema-aware producer that encodes typed values at the NATS boundary.
 *
 * @module
 * @since 0.1.0
 */

import type { MessageSendError } from "@beep/beepgraph-messaging/Errors";

import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { Effect, Schema } from "effect";

// ---------------------------------------------------------------------------
// JSON encoding via Schema (avoids raw JSON.stringify)
// ---------------------------------------------------------------------------

const jsonStringify = Schema.encodeUnknownSync(Schema.UnknownFromJsonString);

// ---------------------------------------------------------------------------
// TypedProducer interface
// ---------------------------------------------------------------------------

/**
 * A producer bound to a topic and schema.
 *
 * @since 0.1.0
 * @category models
 */
export interface TypedProducer<T> {
  readonly send: (id: string, value: T) => Effect.Effect<void, MessageSendError>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a `TypedProducer` bound to the given topic.
 *
 * The encoder is built from a `Schema.Encoder` — any Effect Schema
 * that can encode `T` to its wire form.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeTypedProducer = <T>(
  topic: string,
  encoder: Schema.Encoder<T>
): Effect.Effect<TypedProducer<T>, never, NatsClient> =>
  Effect.gen(function* () {
    const nats = yield* NatsClient;
    const encode = Schema.encodeUnknownSync(encoder);

    return {
      send: (id: string, value: T): Effect.Effect<void, MessageSendError> => {
        const encoded = encode(value);
        const json = jsonStringify(encoded);
        const bytes = new TextEncoder().encode(json);
        return nats.publish(topic, bytes, { "Nats-Msg-Id": id });
      },
    };
  });
