/**
 * Domain Errors: Base Error Types
 *
 * Tagged error hierarchy using Schema.TaggedError for type-safe error handling.
 *
 * @since 2.0.0
 * @module Domain/Error/Base
 */

import { Schema } from "effect"

/**
 * BaseError - Root error type
 *
 * All domain errors extend this base.
 *
 * @since 2.0.0
 * @category Error
 */
export class BaseError extends Schema.TaggedError<BaseError>()("BaseError", {
  message: Schema.String.annotations({
    title: "Error Message",
    description: "Human-readable error description"
  }),

  cause: Schema.optional(Schema.Unknown).annotations({
    title: "Cause",
    description: "Underlying error or failure cause"
  })
}) {}

/**
 * NotImplemented - Temporary error for incomplete implementations
 *
 * Used during development instead of Effect.die to maintain type safety.
 * Should be replaced with actual implementations.
 *
 * @since 2.0.0
 * @category Error
 */
export class NotImplemented extends Schema.TaggedError<NotImplemented>()(
  "NotImplemented",
  {
    message: Schema.String,

    /**
     * Service name
     */
    service: Schema.String.annotations({
      title: "Service",
      description: "Name of the service with unimplemented method"
    }),

    /**
     * Method name
     */
    method: Schema.String.annotations({
      title: "Method",
      description: "Name of the unimplemented method"
    })
  }
) {}
