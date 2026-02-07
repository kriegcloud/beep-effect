/**
 * Domain Errors: SHACL Validation
 *
 * Errors specific to SHACL validation lifecycle including shape loading and
 * report generation.
 *
 * @since 0.1.0
 * @module Domain/Error/Shacl
 */

import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Shacl.errors");

/**
 * ShaclValidationError - SHACL validation processing errors
 *
 * @since 0.1.0
 * @category Error
 */
export class ShaclValidationError extends S.TaggedError<ShaclValidationError>($I`ShaclValidationError`)(
  "ShaclValidationError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ShaclValidationError", {
    description: "Error during SHACL validation processing, including shape evaluation and constraint checking",
  })
) {}

/**
 * ShapesLoadError - Failed to load SHACL shapes
 *
 * @since 0.1.0
 * @category Error
 */
export class ShapesLoadError extends S.TaggedError<ShapesLoadError>($I`ShapesLoadError`)(
  "ShapesLoadError",
  {
    message: S.String,
    shapesUri: S.optional(S.String),
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ShapesLoadError", {
    description: "Error when loading SHACL shapes from a URI or file fails, preventing validation from proceeding",
  })
) {}

/**
 * ValidationReportError - Failed to generate validation report
 *
 * @since 0.1.0
 * @category Error
 */
export class ValidationReportError extends S.TaggedError<ValidationReportError>($I`ValidationReportError`)(
  "ValidationReportError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ValidationReportError", {
    description:
      "Error when generating a SHACL validation report fails, typically due to malformed data or processing issues",
  })
) {}

/**
 * ValidationPolicyError - Validation failed due to policy violation
 *
 * Used when validation results fail the configured severity policy.
 *
 * @since 0.1.0
 * @category Error
 */
export class ValidationPolicyError extends S.TaggedError<ValidationPolicyError>($I`ValidationPolicyError`)(
  "ValidationPolicyError",
  {
    message: S.String,
    violationCount: S.Number,
    warningCount: S.Number,
    severity: S.Literal("Violation", "Warning"),
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ValidationPolicyError", {
    description:
      "Error when SHACL validation fails due to policy violation, indicating the data does not conform to the required severity threshold",
  })
) {}
