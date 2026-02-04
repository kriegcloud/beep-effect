/**
 * Domain Errors: SHACL Validation
 *
 * Errors specific to SHACL validation lifecycle including shape loading and
 * report generation.
 *
 * @since 2.0.0
 * @module Domain/Error/Shacl
 */

import { Schema } from "effect"

/**
 * ShaclValidationError - SHACL validation processing errors
 *
 * @since 2.0.0
 * @category Error
 */
export class ShaclValidationError extends Schema.TaggedError<ShaclValidationError>()(
  "ShaclValidationError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ShapesLoadError - Failed to load SHACL shapes
 *
 * @since 2.0.0
 * @category Error
 */
export class ShapesLoadError extends Schema.TaggedError<ShapesLoadError>()(
  "ShapesLoadError",
  {
    message: Schema.String,
    shapesUri: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ValidationReportError - Failed to generate validation report
 *
 * @since 2.0.0
 * @category Error
 */
export class ValidationReportError extends Schema.TaggedError<ValidationReportError>()(
  "ValidationReportError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ValidationPolicyError - Validation failed due to policy violation
 *
 * Used when validation results fail the configured severity policy.
 *
 * @since 2.0.0
 * @category Error
 */
export class ValidationPolicyError extends Schema.TaggedError<ValidationPolicyError>()(
  "ValidationPolicyError",
  {
    message: Schema.String,
    violationCount: Schema.Number,
    warningCount: Schema.Number,
    severity: Schema.Literal("Violation", "Warning"),
    cause: Schema.optional(Schema.Unknown)
  }
) {}
