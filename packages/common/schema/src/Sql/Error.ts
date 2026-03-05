import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Sql/Error");

/**
 * Severity level for validation errors.
 * - `error`: Blocks further processing, must be fixed
 * - `warning`: Non-blocking, should be addressed
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ErrorSeverity: LiteralKit<readonly ["error", "warning"]> = LiteralKit(["error", "warning"]).annotate(
  $I.annote("ErrorSeverity", {
    description:
      "Severity level for validation errors.\n- `error`: Blocks further processing, must be fixed\n- `warning`: Non-blocking, should be addressed",
  })
);

/**
 * @since 0.0.0
 */
export type ErrorSeverity = typeof ErrorSeverity.Type;

/**
 * Common fields shared by all DSL validation errors.
 * Used for documentation - actual errors use Schema.TaggedError.
 * @since 0.0.0
 * @category DomainModel
 */
export const commonFields = {
  message: S.String,
  code: S.String,
  severity: ErrorSeverity,
  path: S.Array(S.String),
  cause: S.optionalKey(S.DefectWithStack),
  expected: S.OptionFromOptionalKey(S.String),
  received: S.OptionFromOptionalKey(S.String),
  suggestion: S.OptionFromOptionalKey(S.String),
} as const;

/**
 * INV-SQL-ID-001: Identifier exceeds PostgreSQL maximum length.
 *
 * PostgreSQL identifiers are limited to 63 bytes (NAMEDATALEN - 1).
 * Longer identifiers are silently truncated, causing subtle bugs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class IdentifierTooLongError extends TaggedErrorClass<IdentifierTooLongError>($I`IdentifierTooLongError`)(
  "IdentifierTooLongError",
  {
    ...commonFields,
    identifier: S.String,
    length: S.Number,
    maxLength: S.Number,
  },
  $I.annote(`IdentifierTooLongError`, {
    description: "INV-SQL-ID-001: Identifier exceeds PostgreSQL maximum length.",
    documentation:
      "PostgreSQL identifiers are limited to 63 bytes (NAMEDATALEN - 1).\nLonger identifiers are silently truncated, causing subtle bugs.",
  })
) {}

/**
 * INV-SQL-ID-002: Identifier contains invalid characters.
 *
 * PostgreSQL unquoted identifiers must:
 * - Start with a letter (a-z, A-Z) or underscore (_)
 * - Contain only letters, digits (0-9), underscores, and dollar signs ($)
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InvalidIdentifierCharsError extends TaggedErrorClass<InvalidIdentifierCharsError>(
  $I`InvalidIdentifierCharsError`
)(
  "InvalidIdentifierCharsError",
  {
    ...commonFields,
    identifier: S.String,
    invalidChars: S.Array(S.String),
  },
  $I.annote(`InvalidIdentifierCharsError`, {
    description: "INV-SQL-ID-002: Identifier contains invalid characters.",
    documentation:
      "PostgreSQL unquoted identifiers must:\n- Start with a letter (a-z, A-Z) or underscore (_)\n- Contain only letters, digits (0-9), underscores, and dollar signs ($)",
  })
) {}

/**
 * INV-SQL-PK-001: Primary key field cannot be nullable.
 *
 * PostgreSQL PRIMARY KEY constraint implies NOT NULL.
 * A nullable schema type (S.NullOr, S.optional) conflicts with this.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NullablePrimaryKeyError extends TaggedErrorClass<NullablePrimaryKeyError>($I`NullablePrimaryKeyError`)(
  "NullablePrimaryKeyError",
  {
    ...commonFields,
    fieldName: S.String,
  },
  $I.annote(`NullablePrimaryKeyError`, {
    description: "INV-SQL-PK-001: Primary key field cannot be nullable.",
    documentation:
      "PostgreSQL PRIMARY KEY constraint implies NOT NULL.\nA nullable schema type (S.NullOr, S.optional) conflicts with this.",
  })
) {}

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
 * @since 0.0.0
 * @category DomainModel
 */
export class MissingVariantSchemaError extends TaggedErrorClass<MissingVariantSchemaError>(
  $I`MissingVariantSchemaError`
)(
  "MissingVariantSchemaError",
  {
    ...commonFields,
    availableSchemaKeys: S.Array(S.String),
  },
  $I.annote(`MissingVariantSchemaError`, {
    description: "INV-SQL-VS-001: VariantSchema.Field has no schema with AST.",
    documentation:
      "Thrown when extracting AST from a VariantSchema.Field that has no\nschemas with the required `ast` property. This indicates either:\n- A malformed variant field\n- An unsupported variant field type\n- A variant field with empty or undefined schemas",
  })
) {}

/**
 * Unsupported schema type for SQL column derivation.
 *
 * Thrown when a schema type cannot be mapped to any SQL column type.
 * This includes:
 * - Never, Void, Undefined (alone), Symbol, UniqueSymbol types
 * - Null literal alone (without non-null union members)
 * - Union containing only null
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UnsupportedColumnTypeError extends TaggedErrorClass<UnsupportedColumnTypeError>(
  $I`UnsupportedColumnTypeError`
)(
  "UnsupportedColumnTypeError",
  {
    ...commonFields,
    schemaType: S.String,
    reason: S.String,
  },
  $I.annote(`UnsupportedColumnTypeError`, {
    description: "Unsupported schema type for SQL column derivation.",
    documentation:
      "Thrown when a schema type cannot be mapped to any SQL column type.\nThis includes:\n- Never, Void, Undefined (alone), Symbol, UniqueSymbol types\n- Null literal alone (without non-null union members)\n- Union containing only null",
  })
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
 * @since 0.0.0
 * @category DomainModel
 */
export class EmptyModelIdentifierError extends TaggedErrorClass<EmptyModelIdentifierError>(
  $I`EmptyModelIdentifierError`
)(
  "EmptyModelIdentifierError",
  commonFields,
  $I.annote(`EmptyModelIdentifierError`, {
    description: "INV-MODEL-ID-001: Model identifier cannot be empty.",
    documentation:
      "The model identifier is used for:\n- Table name derivation (snake_case conversion)\n- Schema identifiers and titles\n- Error messages and debugging",
  })
) {}

/**
 * INV-MODEL-AI-001: At most one autoIncrement field per model.
 *
 * PostgreSQL allows only one SERIAL/BIGSERIAL per table.
 * Multiple auto-incrementing columns would require separate sequences.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class MultipleAutoIncrementError extends TaggedErrorClass<MultipleAutoIncrementError>(
  $I`MultipleAutoIncrementError`
)(
  "MultipleAutoIncrementError",
  {
    ...commonFields,
    modelName: S.String,
    autoIncrementFields: S.Array(S.String),
  },
  $I.annote(`MultipleAutoIncrementError`, {
    description: "INV-MODEL-AI-001: At most one autoIncrement field per model.",
    documentation:
      "PostgreSQL allows only one SERIAL/BIGSERIAL per table.\nMultiple auto-incrementing columns would require separate sequences.",
  })
) {}

/**
 * INV-MODEL-VALIDATE-001: Model validation failed with multiple errors.
 *
 * Thrown when model validation discovers one or more invariant violations.
 * This aggregates all individual validation errors (field-level, identifier,
 * constraint violations) into a single TaggedError for proper Effect handling.
 * Use Match.tag("ModelValidationAggregateError", ...) for exhaustive matching.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ModelValidationAggregateError extends TaggedErrorClass<ModelValidationAggregateError>(
  $I`ModelValidationAggregateError`
)(
  "ModelValidationAggregateError",
  {
    ...commonFields,
    modelName: S.String,
    errorCount: S.Number,
    /** Individual validation errors that triggered this aggregate */
    errors: S.Array(S.Unknown),
  },
  $I.annote(`ModelValidationAggregateError`, {
    description: "INV-MODEL-VALIDATE-001: Model validation failed with multiple errors.",
    documentation:
      'Thrown when model validation discovers one or more invariant violations.\nThis aggregates all individual validation errors (field-level, identifier,\nconstraint violations) into a single TaggedError for proper Effect handling.\nUse Match.tag("ModelValidationAggregateError", ...) for exhaustive matching.',
  })
) {}

/**
 * INV-SQL-AI-001: AutoIncrement requires integer or bigint type.
 *
 * PostgreSQL SERIAL/BIGSERIAL are syntax sugar for integer/bigint columns.
 * AutoIncrement on other types (string, boolean, etc.) is invalid.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AutoIncrementTypeError extends TaggedErrorClass<AutoIncrementTypeError>($I`AutoIncrementTypeError`)(
  "AutoIncrementTypeError",
  {
    ...commonFields,
    fieldName: S.String,
    actualType: S.String,
  },
  $I.annote(`AutoIncrementTypeError`, {
    description: "INV-SQL-AI-001: AutoIncrement requires integer or bigint type.",
    documentation:
      "PostgreSQL SERIAL/BIGSERIAL are syntax sugar for integer/bigint columns.\nAutoIncrement on other types (string, boolean, etc.) is invalid.",
  })
) {}

/**
 * Union of all DSL validation error types.
 * Used for exhaustive pattern matching with Match.exhaustive.
 * @since 0.0.0
 * @category DomainModel
 */

export const DSLValidationError = S.Union([
  AutoIncrementTypeError,
  IdentifierTooLongError,
  InvalidIdentifierCharsError,
  NullablePrimaryKeyError,
  EmptyModelIdentifierError,
  MultipleAutoIncrementError,
  MissingVariantSchemaError,
  UnsupportedColumnTypeError,
  ModelValidationAggregateError,
])
  .pipe(S.toTaggedUnion("_tag"))
  .annotate(
    $I.annote(`DSLValidationError`, {
      description: "Union of all DSL validation error types.",
      documentation: "Used for exhaustive pattern matching with Match.exhaustive.",
    })
  );
/**
 * @since 0.0.0
 */
export type DSLValidationError = typeof DSLValidationError.Type;

/**
 * @since 0.0.0
 */
export declare namespace DSLValidationError {
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof DSLValidationError.Encoded;
}
