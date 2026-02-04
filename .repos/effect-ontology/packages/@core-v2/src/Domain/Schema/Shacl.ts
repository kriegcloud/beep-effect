/**
 * SHACL Schema Types
 *
 * Pure schema definitions for SHACL validation.
 * These are browser-safe types with no server dependencies.
 *
 * @since 2.0.0
 * @module Domain/Schema/Shacl
 */

import { Schema } from "effect"

/**
 * SHACL violation record
 *
 * @since 2.0.0
 * @category Schema
 */
export class ShaclViolation extends Schema.Class<ShaclViolation>("ShaclViolation")({
  focusNode: Schema.String,
  path: Schema.optional(Schema.String),
  value: Schema.optional(Schema.String),
  message: Schema.String,
  severity: Schema.Literal("Violation", "Warning", "Info"),
  sourceShape: Schema.optional(Schema.String)
}) {}

/**
 * Validation report structure
 *
 * @since 2.0.0
 * @category Schema
 */
export class ShaclValidationReport extends Schema.Class<ShaclValidationReport>("ShaclValidationReport")({
  conforms: Schema.Boolean,
  violations: Schema.Array(ShaclViolation),
  validatedAt: Schema.DateTimeUtc,
  dataGraphTripleCount: Schema.Number,
  shapesGraphTripleCount: Schema.Number,
  durationMs: Schema.Number
}) {}

/**
 * Validation policy for controlling workflow behavior based on severity
 *
 * @since 2.0.0
 * @category Schema
 */
export class ValidationPolicy extends Schema.Class<ValidationPolicy>("ValidationPolicy")({
  /** Fail if any Violation-level results are present (default: true) */
  failOnViolation: Schema.optional(Schema.Boolean),
  /** Fail if any Warning-level results are present (default: false) */
  failOnWarning: Schema.optional(Schema.Boolean),
  /**
   * Log violations but don't fail - allows workflow to continue despite validation issues.
   * Useful for development and initial extraction where quality is improving.
   * Takes precedence over failOnViolation and failOnWarning when true.
   */
  logOnly: Schema.optional(Schema.Boolean)
}) {}
