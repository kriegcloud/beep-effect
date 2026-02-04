/**
 * Event Bus Errors
 *
 * Typed errors for event bus operations including publishing,
 * job queuing, and Pub/Sub integration.
 *
 * @since 2.0.0
 * @module Domain/Error/EventBus
 */

import { Schema } from "effect"

/**
 * Error during event bus operations
 *
 * @since 2.0.0
 */
export class EventBusError extends Schema.TaggedError<EventBusError>()(
  "EventBusError",
  {
    method: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Error during Cloud Pub/Sub operations
 *
 * @since 2.0.0
 */
export class PubSubError extends Schema.TaggedError<PubSubError>()(
  "PubSubError",
  {
    method: Schema.String,
    topic: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Error when a job exceeds max retry attempts
 *
 * @since 2.0.0
 */
export class DeadLetterError extends Schema.TaggedError<DeadLetterError>()(
  "DeadLetterError",
  {
    jobId: Schema.String,
    jobType: Schema.String,
    attempts: Schema.Number,
    lastError: Schema.String
  }
) {}
