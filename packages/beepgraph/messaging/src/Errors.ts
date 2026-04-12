/**
 * Typed error classes for NATS messaging failures.
 *
 * Each error extends `Schema.TaggedErrorClass` so it carries a discriminating
 * `_tag` field and works seamlessly with `Effect.catchTag`,
 * `Effect.catchTags`, and the typed error channel.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { NatsConnectionError, NatsTimeout } from "@beep/beepgraph-messaging/Errors"
 *
 * declare const connect: Effect.Effect<void, NatsConnectionError>
 *
 * const handled = connect.pipe(
 *   Effect.catchTag("NatsConnectionError", (err) =>
 *     Effect.log(`Connection to ${err.url} failed: ${err.cause}`)
 *   )
 * )
 * ```
 *
 * @since 0.0.0
 * @module @beep/beepgraph-messaging/Errors
 */
import { Schema } from "effect";

// ---------------------------------------------------------------------------
// NatsConnectionError
// ---------------------------------------------------------------------------

/**
 * Failed to connect to a NATS server.
 *
 * Raised during initial connection or when all reconnection attempts have been
 * exhausted.
 *
 * @since 0.0.0
 * @category errors
 */
export class NatsConnectionError extends Schema.TaggedErrorClass<NatsConnectionError>()("NatsConnectionError", {
  /** The NATS server URL that was targeted. */
  url: Schema.String,
  /** Human-readable description of the connection failure. */
  cause: Schema.String,
}) {
  override get message(): string {
    return `NATS connection to ${this.url} failed: ${this.cause}`;
  }
}

// ---------------------------------------------------------------------------
// NatsTimeout
// ---------------------------------------------------------------------------

/**
 * A request timed out waiting for a response on the given topic.
 *
 * Typically surfaces when using the request/reply pattern and the responder
 * does not answer within the configured deadline.
 *
 * @since 0.0.0
 * @category errors
 */
export class NatsTimeout extends Schema.TaggedErrorClass<NatsTimeout>()("NatsTimeout", {
  /** The NATS subject the request was published to. */
  topic: Schema.String,
  /** Correlation identifier for the in-flight request. */
  requestId: Schema.String,
  /** Elapsed wall-clock time in milliseconds before the timeout fired. */
  durationMs: Schema.Number,
}) {
  override get message(): string {
    return `NATS request on "${this.topic}" timed out after ${this.durationMs}ms (requestId=${this.requestId})`;
  }
}

// ---------------------------------------------------------------------------
// MessageParseError
// ---------------------------------------------------------------------------

/**
 * Failed to decode an inbound message from wire format.
 *
 * Wraps the raw payload so callers can inspect what arrived on the wire when
 * schema validation or JSON parsing fails.
 *
 * @since 0.0.0
 * @category errors
 */
export class MessageParseError extends Schema.TaggedErrorClass<MessageParseError>()("MessageParseError", {
  /** The NATS subject the message was received on. */
  topic: Schema.String,
  /** The raw message payload that could not be decoded. */
  raw: Schema.Unknown,
}) {
  override get message(): string {
    return `Failed to parse NATS message on "${this.topic}"`;
  }
}

// ---------------------------------------------------------------------------
// MessageSendError
// ---------------------------------------------------------------------------

/**
 * Failed to publish a message to a NATS subject.
 *
 * Raised when the underlying NATS client rejects a publish or when the
 * connection is in a state that prevents sending.
 *
 * @since 0.0.0
 * @category errors
 */
export class MessageSendError extends Schema.TaggedErrorClass<MessageSendError>()("MessageSendError", {
  /** The NATS subject the message was intended for. */
  topic: Schema.String,
  /** Human-readable description of the send failure. */
  cause: Schema.String,
}) {
  override get message(): string {
    return `Failed to send NATS message on "${this.topic}": ${this.cause}`;
  }
}
