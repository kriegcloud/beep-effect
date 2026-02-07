/**
 * Event Bus Errors
 *
 * Typed errors for event bus operations including publishing,
 * job queuing, and Pub/Sub integration.
 *
 * @since 0.1.0
 * @module Domain/Error/EventBus
 */

import * as S from "effect/Schema";

/**
 * Error during event bus operations
 *
 * @since 0.1.0
 */
export class EventBusError extends S.TaggedError<EventBusError>()("EventBusError", {
  method: S.String,
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

/**
 * Error during Cloud Pub/Sub operations
 *
 * @since 0.1.0
 */
export class PubSubError extends S.TaggedError<PubSubError>()("PubSubError", {
  method: S.String,
  topic: S.String,
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

/**
 * Error when a job exceeds max retry attempts
 *
 * @since 0.1.0
 */
export class DeadLetterError extends S.TaggedError<DeadLetterError>()("DeadLetterError", {
  jobId: S.String,
  jobType: S.String,
  attempts: S.Number,
  lastError: S.String,
}) {}
