import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("errors/activity.errors");

/**
 * Activity timeout error
 */
export class ActivityTimeoutError extends S.TaggedError<ActivityTimeoutError>($I`ActivityTimeout`)(
  "ActivityTimeout",
  {
    stage: S.String,
    durationMs: S.Number,
    message: S.String,
  },
  $I.annotations("ActivityTimeout", {
    description: "Activity timeout error",
  })
) {}

/**
 * Service failure during activity
 */
export class ActivityServiceError extends S.TaggedError<ActivityServiceError>($I`ActivityServiceError`)(
  "ActivityServiceError",
  {
    service: S.String,
    operation: S.String,
    message: S.String,
    retryable: S.Boolean,
  },
  $I.annotations("ActivityServiceError", {
    description: "Activity service error",
  })
) {}

/**
 * Resource not found during activity
 */
export class ActivityNotFoundError extends S.TaggedError<ActivityNotFoundError>($I`ActivityNotFoundError`)(
  "ActivityNotFoundError",
  {
    resourceType: S.String,
    resourceId: S.String,
    message: S.String,
  },
  $I.annotations("ActivityNotFoundError", {
    description: "Resource not found during activity",
  })
) {}

/**
 * Validation failure during activity
 */
export class ActivityValidationError extends S.TaggedError<ActivityValidationError>($I`ActivityValidationError`)(
  "ActivityValidationError",
  {
    field: S.optional(S.String),
    reason: S.String,
    message: S.String,
  },
  $I.annotations("ActivityValidationError", {
    description: "Validation failure during activity",
  })
) {}

/**
 * Generic activity error (fallback)
 */
export class ActivityGenericError extends S.TaggedError<ActivityGenericError>($I`ActivityGenericError`)(
  "ActivityGenericError",
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("ActivityGenericError", {
    description: "Generic activity error (fallback)",
  })
) {}
/**
 * Union of all activity error types
 *
 * Use this as the error schema for Activity.make()
 */
export class ActivityError extends S.Union(
  ActivityTimeoutError,
  ActivityServiceError,
  ActivityNotFoundError,
  ActivityValidationError,
  ActivityGenericError
).annotations(
  $I.annotations("ActivityError", {
    description: "Union of all activity error types. Use this as the error schema for Activity.make()",
  })
) {}

export declare namespace ActivityError {
  export type Type = typeof ActivityError.Type;
  export type Encoded = typeof ActivityError.Encoded;
}
