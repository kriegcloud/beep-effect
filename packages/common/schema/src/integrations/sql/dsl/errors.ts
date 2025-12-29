/**
 * DSL Validation Error Hierarchy
 *
 * TaggedError classes for invariant validation of the SQL DSL.
 * All errors extend Schema.TaggedError for Effect ecosystem integration.
 *
 * @module
 * @since 1.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/sql/dsl/errors");
// ============================================================================
// Error Severity Types
// ============================================================================

/**
 * Severity level for validation errors.
 * - `error`: Blocks further processing, must be fixed
 * - `warning`: Non-blocking, should be addressed
 * @since 1.0.0
 */
export class ErrorSeverity extends BS.StringLiteralKit("error", "warning").annotations(
  $I.annotations("ErrorSeverity", {
    description: "Severity level for validation errors.",
  })
) {}

export declare namespace ErrorSeverity {
  export type Type = typeof ErrorSeverity.Type;
}

// ============================================================================
// Base Error Interface
// ============================================================================

/**
 * Common fields shared by all DSL validation errors.
 * Used for documentation - actual errors use Schema.TaggedError.
 * @since 1.0.0
 */
export interface DSLValidationErrorBase {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity.Type;
  readonly path: ReadonlyArray<string>;
  readonly expected?: string;
  readonly received?: string;
  readonly suggestion?: string;
}

const commonErrorFields = {
  message: S.String,
  code: S.String,
  severity: ErrorSeverity,
  path: S.Array(S.String),
  expected: S.optional(S.String),
  received: S.optional(S.String),
  suggestion: S.optional(S.String),
} as const;

// ============================================================================
// Field-Level Errors
// ============================================================================

/**
 * INV-SQL-AI-001: AutoIncrement requires integer or bigint type.
 *
 * PostgreSQL SERIAL/BIGSERIAL are syntax sugar for integer/bigint columns.
 * AutoIncrement on other types (string, boolean, etc.) is invalid.
 *
 * @since 1.0.0
 * @category errors
 */
export class AutoIncrementTypeError extends S.TaggedError<AutoIncrementTypeError>()("AutoIncrementTypeError", {
  ...commonErrorFields,
  fieldName: S.String,
  actualType: S.String,
}) {}

/**
 * INV-SQL-ID-001: Identifier exceeds PostgreSQL maximum length.
 *
 * PostgreSQL identifiers are limited to 63 bytes (NAMEDATALEN - 1).
 * Longer identifiers are silently truncated, causing subtle bugs.
 *
 * @since 1.0.0
 * @category errors
 */
export class IdentifierTooLongError extends S.TaggedError<IdentifierTooLongError>()("IdentifierTooLongError", {
  ...commonErrorFields,
  identifier: S.String,
  length: S.Number,
  maxLength: S.Number,
}) {}

/**
 * INV-SQL-ID-002: Identifier contains invalid characters.
 *
 * PostgreSQL unquoted identifiers must:
 * - Start with a letter (a-z, A-Z) or underscore (_)
 * - Contain only letters, digits (0-9), underscores, and dollar signs ($)
 *
 * @since 1.0.0
 * @category errors
 */
export class InvalidIdentifierCharsError extends S.TaggedError<InvalidIdentifierCharsError>()(
  "InvalidIdentifierCharsError",
  {
    ...commonErrorFields,
    identifier: S.String,
    invalidChars: S.Array(S.String),
  }
) {}

/**
 * INV-SQL-PK-001: Primary key field cannot be nullable.
 *
 * PostgreSQL PRIMARY KEY constraint implies NOT NULL.
 * A nullable schema type (S.NullOr, S.optional) conflicts with this.
 *
 * @since 1.0.0
 * @category errors
 */
export class NullablePrimaryKeyError extends S.TaggedError<NullablePrimaryKeyError>()("NullablePrimaryKeyError", {
  ...commonErrorFields,
  fieldName: S.String,
}) {}

// ============================================================================
// Column Type Derivation Errors
// ============================================================================

/**
 * INV-SQL-VS-001: VariantSchema.Field has no schema with AST.
 *
 * Thrown when extracting AST from a VariantSchema.Field that has no
 * schemas with the required `ast` property. This indicates either:
 * - A malformed variant field
 * - An unsupported variant field type
 * - A variant field with empty or undefined schemas
 *
 * @since 1.0.0
 * @category errors
 */
export class MissingVariantSchemaError extends S.TaggedError<MissingVariantSchemaError>()("MissingVariantSchemaError", {
  ...commonErrorFields,
  availableSchemaKeys: S.Array(S.String),
}) {}

/**
 * Unsupported schema type for SQL column derivation.
 *
 * Thrown when a schema type cannot be mapped to any SQL column type.
 * This includes:
 * - Never, Void, Undefined (alone), Symbol, UniqueSymbol types
 * - Null literal alone (without non-null union members)
 * - Union containing only null
 *
 * @since 1.0.0
 * @category errors
 */
export class UnsupportedColumnTypeError extends S.TaggedError<UnsupportedColumnTypeError>()(
  "UnsupportedColumnTypeError",
  {
    ...commonErrorFields,
    schemaType: S.String,
    reason: S.String,
  }
) {}

// ============================================================================
// Model-Level Errors
// ============================================================================

/**
 * INV-MODEL-ID-001: Model identifier cannot be empty.
 *
 * The model identifier is used for:
 * - Table name derivation (snake_case conversion)
 * - Schema identifiers and titles
 * - Error messages and debugging
 *
 * @since 1.0.0
 * @category errors
 */
export class EmptyModelIdentifierError extends S.TaggedError<EmptyModelIdentifierError>()(
  "EmptyModelIdentifierError",
  commonErrorFields
) {}

/**
 * INV-MODEL-AI-001: At most one autoIncrement field per model.
 *
 * PostgreSQL allows only one SERIAL/BIGSERIAL per table.
 * Multiple auto-incrementing columns would require separate sequences.
 *
 * @since 1.0.0
 * @category errors
 */
export class MultipleAutoIncrementError extends S.TaggedError<MultipleAutoIncrementError>()(
  "MultipleAutoIncrementError",
  {
    ...commonErrorFields,
    modelName: S.String,
    autoIncrementFields: S.Array(S.String),
  }
) {}

/**
 * INV-MODEL-VALIDATE-001: Model validation failed with multiple errors.
 *
 * Thrown when model validation discovers one or more invariant violations.
 * This aggregates all individual validation errors (field-level, identifier,
 * constraint violations) into a single TaggedError for proper Effect handling.
 *
 * Use Match.tag("ModelValidationAggregateError", ...) for exhaustive matching.
 *
 * @since 1.0.0
 * @category errors
 */
export class ModelValidationAggregateError extends S.TaggedError<ModelValidationAggregateError>()(
  "ModelValidationAggregateError",
  {
    ...commonErrorFields,
    modelName: S.String,
    errorCount: S.Number,
    /** Individual validation errors that triggered this aggregate */
    errors: S.Array(S.Unknown),
  }
) {}

// ============================================================================
// Union Type for All DSL Validation Errors
// ============================================================================

/**
 * Union of all DSL validation error types.
 * Used for exhaustive pattern matching with Match.exhaustive.
 * @since 1.0.0
 * @category errors
 */
export type DSLValidationError =
  | AutoIncrementTypeError
  | IdentifierTooLongError
  | InvalidIdentifierCharsError
  | NullablePrimaryKeyError
  | EmptyModelIdentifierError
  | MultipleAutoIncrementError
  | MissingVariantSchemaError
  | UnsupportedColumnTypeError
  | ModelValidationAggregateError;

/**
 * Schema for encoding/decoding DSLValidationError union.
 * @since 1.0.0
 * @category schemas
 */
export const DSLValidationErrorSchema = S.Union(
  AutoIncrementTypeError,
  IdentifierTooLongError,
  InvalidIdentifierCharsError,
  NullablePrimaryKeyError,
  EmptyModelIdentifierError,
  MultipleAutoIncrementError,
  MissingVariantSchemaError,
  UnsupportedColumnTypeError
);
