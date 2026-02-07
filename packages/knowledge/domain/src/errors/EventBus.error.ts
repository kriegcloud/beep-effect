/**
 * Event Bus Errors
 *
 * Typed errors for event bus operations including publishing,
 * job queuing, and Pub/Sub integration.
 *
 * @since 0.1.0
 * @module Domain/Error/EventBus
 */

import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/EventBus.error");

/**
 * Error during event bus operations
 *
 * @since 0.1.0
 */
export class EventBusError extends S.TaggedError<EventBusError>($I`EventBusError`)(
  "EventBusError",
  {
    method: S.String,
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("EventBusError", {
    description: "Error during in-process event bus operations (publishing, subscribing, job queueing).",
  })
) {}

/**
 * Error during Cloud Pub/Sub operations
 *
 * @since 0.1.0
 */
export class PubSubError extends S.TaggedError<PubSubError>($I`PubSubError`)(
  "PubSubError",
  {
    method: S.String,
    topic: S.String,
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("PubSubError", {
    description: "Error during Pub/Sub integration operations (topic publish/subscribe).",
  })
) {}

/**
 * Error when a job exceeds max retry attempts
 *
 * @since 0.1.0
 */
export class DeadLetterError extends S.TaggedError<DeadLetterError>($I`DeadLetterError`)(
  "DeadLetterError",
  {
    jobId: S.String,
    jobType: S.String,
    attempts: S.Number,
    lastError: S.String,
  },
  $I.annotations("DeadLetterError", {
    description: "Job exceeded max retry attempts and was moved to the dead-letter path.",
  })
) {}
