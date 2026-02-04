/**
 * Domain: Activity Errors
 *
 * Typed error schemas for workflow activities.
 * These are serializable for journaling by @effect/workflow.
 *
 * @since 2.0.0
 * @module Domain/Error/Activity
 */

import { Schema } from "effect"

/**
 * Activity timeout error
 */
export const ActivityTimeoutError = Schema.Struct({
  _tag: Schema.Literal("ActivityTimeout"),
  stage: Schema.String,
  durationMs: Schema.Number,
  message: Schema.String
})

/**
 * Service failure during activity
 */
export const ActivityServiceError = Schema.Struct({
  _tag: Schema.Literal("ActivityServiceFailure"),
  service: Schema.String,
  operation: Schema.String,
  message: Schema.String,
  retryable: Schema.Boolean
})

/**
 * Resource not found during activity
 */
export const ActivityNotFoundError = Schema.Struct({
  _tag: Schema.Literal("ActivityNotFound"),
  resourceType: Schema.String,
  resourceId: Schema.String,
  message: Schema.String
})

/**
 * Validation failure during activity
 */
export const ActivityValidationError = Schema.Struct({
  _tag: Schema.Literal("ActivityValidation"),
  field: Schema.optional(Schema.String),
  reason: Schema.String,
  message: Schema.String
})

/**
 * Generic activity error (fallback)
 */
export const ActivityGenericError = Schema.Struct({
  _tag: Schema.Literal("ActivityGeneric"),
  message: Schema.String,
  cause: Schema.optional(Schema.String)
})

/**
 * Union of all activity error types
 *
 * Use this as the error schema for Activity.make()
 */
export const ActivityError = Schema.Union(
  ActivityTimeoutError,
  ActivityServiceError,
  ActivityNotFoundError,
  ActivityValidationError,
  ActivityGenericError
)

export type ActivityError = typeof ActivityError.Type

/**
 * Helper to create a generic error from unknown
 */
export const toActivityError = (e: unknown): ActivityError => ({
  _tag: "ActivityGeneric",
  message: e instanceof Error ? e.message : String(e),
  cause: e instanceof Error && e.cause ? String(e.cause) : undefined
})

/**
 * Helper to create service error
 */
export const serviceError = (
  service: string,
  operation: string,
  e: unknown,
  retryable = false
): ActivityError => ({
  _tag: "ActivityServiceFailure",
  service,
  operation,
  message: e instanceof Error ? e.message : String(e),
  retryable
})

/**
 * Helper to create not found error
 */
export const notFoundError = (
  resourceType: string,
  resourceId: string
): ActivityError => ({
  _tag: "ActivityNotFound",
  resourceType,
  resourceId,
  message: `${resourceType} not found: ${resourceId}`
})
