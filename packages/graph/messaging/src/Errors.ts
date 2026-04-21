/**
 * Typed error classes for NATS messaging failures.
 *
 * Each error extends `S.TaggedErrorClass` so it carries a discriminating
 * `_tag` field and works seamlessly with `Effect.catchTag`,
 * `Effect.catchTags`, and the typed error channel.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { NatsConnectionError, NatsTimeout } from "@beep/graph-messaging/Errors"
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
 * @module @beep/graph-messaging/Errors
 */

import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { Duration } from "effect";
import { dual } from "effect/Function";
import { $GraphMessagingId} from "@beep/identity";


const $I = $GraphMessagingId.create("Errors")
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
export class NatsConnectionError extends TaggedErrorClass<NatsConnectionError>()("NatsConnectionError", {
  /** The NATS server URL that was targeted. */
  url: S.String.annotateKey({
    description: "The NATS server URL that was targeted."
  }),
  /** Human-readable description of the connection failure. */
  cause: S.DefectWithStack.annotateKey({
    description: "Human-readable description of the connection failure."
  }),
},
  $I.annote("NatsConnectionError", {
    description: "Failed to connect to a NATS server. Raised during initial connection or when all reconnection attempts have been exhausted."
  })
  ) {
  override get message(): string {
    return `NATS connection to ${this.url} failed: ${this.cause}`;
  }
  static readonly new: {
    (cause: unknown, url: string): NatsConnectionError
    (url: string): (cause: unknown) => NatsConnectionError
  } = dual(2, (cause: unknown, url: string): NatsConnectionError => new NatsConnectionError(
    {
      cause,
      url,
    }))
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
export class NatsTimeout extends S.TaggedErrorClass<NatsTimeout>()("NatsTimeout", {
  /** The NATS subject the request was published to. */
  topic: S.String.annotateKey({
    description: "The NATS subject the request was published to."
  }),
  /** Correlation identifier for the in-flight request. */
  requestId: S.String.annotateKey({
    description: "Correlation identifier for the in-flight request."
  }),
  /** Elapsed wall-clock time in milliseconds before the timeout fired. */
  durationMs: S.DurationFromMillis.annotateKey({
    description: "Elapsed wall-clock time in milliseconds before the timeout fired."
  }),
}) {
  override get message(): string {
    return `NATS request on "${this.topic}" timed out after ${Duration.toMillis(this.durationMs)}ms (requestId=${this.requestId})`;
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
export class MessageParseError extends TaggedErrorClass<MessageParseError>()("MessageParseError", {
  /** The NATS subject the message was received on. */
  topic: S.String.annotateKey({
    description: "The NATS subject the message was received on."
  }),
  /** The raw message payload that could not be decoded. */
  raw: S.Unknown,
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
export class MessageSendError extends S.TaggedErrorClass<MessageSendError>()("MessageSendError", {
  /** The NATS subject the message was intended for. */
  topic: S.String,
  /** Human-readable description of the send failure. */
  cause: S.DefectWithStack,
}) {
  override get message(): string {
    return `Failed to send NATS message on "${this.topic}": ${this.cause}`;
  }
}
