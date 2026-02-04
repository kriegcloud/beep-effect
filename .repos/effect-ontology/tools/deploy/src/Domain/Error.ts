/**
 * Domain Error Types
 *
 * Type-safe error definitions for the deploy CLI using Schema.TaggedError.
 *
 * @since 1.0.0
 * @module Domain/Error
 */

import { Schema } from "effect"

// =============================================================================
// Terraform Errors
// =============================================================================

/**
 * TerraformError - terraform command failed
 */
export class TerraformError extends Schema.TaggedError<TerraformError>()(
  "TerraformError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Unknown)
  }
) {
  get [Symbol.toStringTag]() {
    return "TerraformError"
  }
}

// =============================================================================
// Configuration Errors
// =============================================================================

/**
 * ConfigValidationError - invalid configuration value
 */
export class ConfigValidationError extends Schema.TaggedError<ConfigValidationError>()(
  "ConfigValidationError",
  {
    message: Schema.String,
    field: Schema.String,
    expected: Schema.String,
    received: Schema.optional(Schema.String)
  }
) {
  get [Symbol.toStringTag]() {
    return "ConfigValidationError"
  }
}

/**
 * TfVarsParseError - malformed .tfvars file
 */
export class TfVarsParseError extends Schema.TaggedError<TfVarsParseError>()(
  "TfVarsParseError",
  {
    message: Schema.String,
    filePath: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {
  get [Symbol.toStringTag]() {
    return "TfVarsParseError"
  }
}

// =============================================================================
// Docker Errors
// =============================================================================

/**
 * DockerError - docker command failed
 */
export class DockerError extends Schema.TaggedError<DockerError>()(
  "DockerError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.optional(Schema.String)
  }
) {
  get [Symbol.toStringTag]() {
    return "DockerError"
  }
}

// =============================================================================
// GCloud Errors
// =============================================================================

/**
 * GcloudError - gcloud command failed
 */
export class GcloudError extends Schema.TaggedError<GcloudError>()(
  "GcloudError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.optional(Schema.String)
  }
) {
  get [Symbol.toStringTag]() {
    return "GcloudError"
  }
}

// =============================================================================
// State Management Errors
// =============================================================================

/**
 * StateError - terraform state operation failed
 */
export class StateError extends Schema.TaggedError<StateError>()(
  "StateError",
  {
    message: Schema.String,
    operation: Schema.Literal("lock", "unlock", "pull", "push"),
    cause: Schema.optional(Schema.Unknown)
  }
) {
  get [Symbol.toStringTag]() {
    return "StateError"
  }
}

// =============================================================================
// Safety Errors
// =============================================================================

/**
 * SafetyError - operation blocked for safety reasons
 */
export class SafetyError extends Schema.TaggedError<SafetyError>()(
  "SafetyError",
  {
    message: Schema.String,
    operation: Schema.String,
    environment: Schema.String
  }
) {
  get [Symbol.toStringTag]() {
    return "SafetyError"
  }
}

// =============================================================================
// Health Check Errors
// =============================================================================

/**
 * HealthCheckError - service health check failed
 */
export class HealthCheckError extends Schema.TaggedError<HealthCheckError>()(
  "HealthCheckError",
  {
    message: Schema.String,
    url: Schema.String,
    expectedStatus: Schema.Number,
    actualStatus: Schema.optional(Schema.Number),
    responseBody: Schema.optional(Schema.String),
    logsUrl: Schema.optional(Schema.String)
  }
) {
  get [Symbol.toStringTag]() {
    return "HealthCheckError"
  }
}

// =============================================================================
// Aggregate Error Type
// =============================================================================

/**
 * DeployError - union of all deploy-related errors
 */
export type DeployError =
  | TerraformError
  | ConfigValidationError
  | TfVarsParseError
  | DockerError
  | GcloudError
  | StateError
  | SafetyError
  | HealthCheckError
