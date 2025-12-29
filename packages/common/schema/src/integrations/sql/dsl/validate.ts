/**
 * DSL Invariant Validation Functions
 *
 * Runtime validators that enforce documented invariants at Field/Model creation time.
 * All validators return Effect.Effect<void, SpecificError> for composability.
 *
 * Validated invariants:
 * - INV-SQL-AI-001: AutoIncrement requires integer/bigint type
 * - INV-SQL-ID-001: Identifier length <= 63 characters
 * - INV-SQL-ID-002: Valid SQL identifier characters
 * - INV-MODEL-ID-001: Non-empty model identifier
 * - INV-MODEL-AI-001: Single autoIncrement per model
 * - INV-SQL-PK-001: Primary key non-nullability
 *
 * @module
 * @since 1.0.0
 */

import { thunkEffectVoid, thunkEmptyReadonlyArray } from "@beep/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import {
  AutoIncrementTypeError,
  type DSLValidationError,
  EmptyModelIdentifierError,
  IdentifierTooLongError,
  InvalidIdentifierCharsError,
  MultipleAutoIncrementError,
  NullablePrimaryKeyError,
} from "./errors";
import type { ColumnDef } from "./types";

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Helper to extract error from an Either, returning Option.
 * Used to work around TypeScript's exactOptionalPropertyTypes with union types.
 * @internal
 */
const extractLeft = <E>(either: Either.Either<unknown, E>): O.Option<E> =>
  either._tag === "Left" ? O.some(either.left) : O.none();

// ============================================================================
// Constants
// ============================================================================

/**
 * PostgreSQL maximum identifier length (NAMEDATALEN - 1).
 * @internal
 */
const POSTGRES_MAX_IDENTIFIER_LENGTH = 63;

/**
 * Valid SQL identifier pattern (unquoted).
 * Must start with letter or underscore, followed by letters, digits, underscores, or dollar signs.
 * @internal
 */
const SQL_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;

/**
 * Pattern to extract invalid characters from an identifier.
 * @internal
 */
const INVALID_CHAR_PATTERN = /[^a-zA-Z0-9_$]/g;

// ============================================================================
// Field-Level Validators
// ============================================================================

/**
 * INV-SQL-AI-001: Validates autoIncrement requires integer or bigint type.
 *
 * PostgreSQL SERIAL/BIGSERIAL types are only valid with integer/bigint columns.
 *
 * @param fieldName - The name of the field being validated
 * @param def - The column definition to validate
 * @returns Effect that succeeds if valid, fails with AutoIncrementTypeError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validateAutoIncrementType = (
  fieldName: string,
  def: ColumnDef
): Effect.Effect<void, AutoIncrementTypeError> =>
  F.pipe(
    Match.value({ autoIncrement: def.autoIncrement, type: def.type }),
    Match.when(
      ({ autoIncrement, type }) => autoIncrement === true && type !== "integer" && type !== "bigint",
      ({ type }) =>
        Effect.fail(
          new AutoIncrementTypeError({
            message: `AutoIncrement requires integer or bigint type, but field '${fieldName}' has type '${type}'`,
            code: "INV-SQL-AI-001",
            severity: "error",
            path: [fieldName, "autoIncrement"],
            expected: "'integer' or 'bigint'",
            received: `'${type}'`,
            suggestion: "Change column type to 'integer' or 'bigint', or remove autoIncrement",
            fieldName,
            actualType: type,
          })
        )
    ),
    Match.orElse(thunkEffectVoid)
  );

/**
 * INV-SQL-ID-001: Validates identifier length does not exceed PostgreSQL limit.
 *
 * PostgreSQL silently truncates identifiers longer than 63 bytes.
 *
 * @param identifier - The identifier to validate (table name, column name, etc.)
 * @param context - Context path for error reporting (e.g., ["User", "id"])
 * @returns Effect that succeeds if valid, fails with IdentifierTooLongError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validateIdentifierLength = (
  identifier: string,
  context: ReadonlyArray<string>
): Effect.Effect<void, IdentifierTooLongError> => {
  const length = F.pipe(identifier, Str.length);
  return F.pipe(
    Match.value(length > POSTGRES_MAX_IDENTIFIER_LENGTH),
    Match.when(true, () =>
      Effect.fail(
        new IdentifierTooLongError({
          message: `Identifier '${identifier}' exceeds PostgreSQL maximum length of ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
          code: "INV-SQL-ID-001",
          severity: "error",
          path: F.pipe(context, A.fromIterable),
          expected: `<= ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
          received: `${length} characters`,
          suggestion: `Shorten the identifier to ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters or less`,
          identifier,
          length,
          maxLength: POSTGRES_MAX_IDENTIFIER_LENGTH,
        })
      )
    ),
    Match.when(false, thunkEffectVoid),
    Match.exhaustive
  );
};

/**
 * INV-SQL-ID-002: Validates identifier contains only valid SQL characters.
 *
 * Unquoted PostgreSQL identifiers must:
 * - Start with a letter (a-z, A-Z) or underscore (_)
 * - Contain only letters, digits (0-9), underscores, and dollar signs ($)
 *
 * @param identifier - The identifier to validate
 * @param context - Context path for error reporting
 * @returns Effect that succeeds if valid, fails with InvalidIdentifierCharsError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validateIdentifierChars = (
  identifier: string,
  context: ReadonlyArray<string>
): Effect.Effect<void, InvalidIdentifierCharsError> => {
  const isValid = SQL_IDENTIFIER_PATTERN.test(identifier);
  const extractInvalidChars = (): ReadonlyArray<string> => {
    const matches = identifier.match(INVALID_CHAR_PATTERN);
    return F.pipe(
      O.fromNullable(matches),
      O.map((m) => F.pipe(m, A.fromIterable, A.dedupe)),
      O.getOrElse(thunkEmptyReadonlyArray<string>)
    );
  };

  return F.pipe(
    Match.value(isValid),
    Match.when(false, () => {
      const invalidChars = extractInvalidChars();
      return Effect.fail(
        new InvalidIdentifierCharsError({
          message: `Identifier '${identifier}' contains invalid characters for SQL`,
          code: "INV-SQL-ID-002",
          severity: "error",
          path: F.pipe(context, A.fromIterable),
          expected:
            "Letters (a-z, A-Z), digits (0-9), underscores (_), dollar signs ($); must start with letter or underscore",
          received: `Contains: ${F.pipe(invalidChars, A.join(", "))}`,
          suggestion: "Use only valid SQL identifier characters or quote the identifier",
          identifier,
          invalidChars,
        })
      );
    }),
    Match.when(true, thunkEffectVoid),
    Match.exhaustive
  );
};

/**
 * INV-SQL-PK-001: Validates primary key field is not nullable.
 *
 * PostgreSQL PRIMARY KEY constraint implies NOT NULL.
 * The schema's nullability is checked via the isNullable parameter.
 *
 * @param fieldName - The name of the field being validated
 * @param isPrimaryKey - Whether the field is marked as primary key
 * @param isNullableField - Whether the schema allows null/undefined
 * @returns Effect that succeeds if valid, fails with NullablePrimaryKeyError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validatePrimaryKeyNonNullable = (
  fieldName: string,
  isPrimaryKey: boolean,
  isNullableField: boolean
): Effect.Effect<void, NullablePrimaryKeyError> =>
  F.pipe(
    Match.value({ isPrimaryKey, isNullableField }),
    Match.when({ isPrimaryKey: true, isNullableField: true }, () =>
      Effect.fail(
        new NullablePrimaryKeyError({
          message: `Primary key field '${fieldName}' cannot be nullable`,
          code: "INV-SQL-PK-001",
          severity: "error",
          path: [fieldName, "primaryKey"],
          expected: "Non-nullable schema (e.g., S.String, S.Int)",
          received: "Nullable schema (e.g., S.NullOr, S.optional)",
          suggestion: "Remove S.NullOr or S.optional wrapper from the schema, or remove primaryKey constraint",
          fieldName,
        })
      )
    ),
    Match.orElse(thunkEffectVoid)
  );

// ============================================================================
// Model-Level Validators
// ============================================================================

/**
 * INV-MODEL-ID-001: Validates model identifier is non-empty.
 *
 * The model identifier is used for table name derivation and schema identification.
 * An empty identifier would result in an empty or underscore-only table name.
 *
 * @param identifier - The model identifier to validate
 * @returns Effect that succeeds if valid, fails with EmptyModelIdentifierError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validateModelIdentifier = (identifier: string): Effect.Effect<void, EmptyModelIdentifierError> =>
  F.pipe(
    Match.value(F.pipe(identifier, Str.isEmpty)),
    Match.when(true, () =>
      Effect.fail(
        new EmptyModelIdentifierError({
          message: "Model identifier cannot be empty",
          code: "INV-MODEL-ID-001",
          severity: "error",
          path: ["Model", "identifier"],
          expected: "Non-empty string identifier",
          received: "Empty string",
          suggestion: "Provide a meaningful identifier like 'User', 'Order', 'Product'",
        })
      )
    ),
    Match.when(false, thunkEffectVoid),
    Match.exhaustive
  );

/**
 * INV-MODEL-AI-001: Validates at most one autoIncrement field per model.
 *
 * PostgreSQL SERIAL creates a sequence per column. Multiple autoIncrement
 * fields would require manual sequence management which the DSL doesn't support.
 *
 * @param modelName - The name of the model being validated
 * @param columns - Record of column definitions
 * @returns Effect that succeeds if valid, fails with MultipleAutoIncrementError if invalid
 *
 * @since 1.0.0
 * @category validators
 */
export const validateSingleAutoIncrement = (
  modelName: string,
  columns: Record<string, ColumnDef>
): Effect.Effect<void, MultipleAutoIncrementError> => {
  const autoIncrementFields = F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.autoIncrement === true),
    A.map(([key]) => key)
  );

  // Check if more than one autoIncrement field exists
  // Use A.drop(1) + A.isNonEmptyArray instead of .length > 1 (Effect idiom)
  const hasMultipleAutoIncrement = F.pipe(autoIncrementFields, A.drop(1), A.isNonEmptyArray);

  return F.pipe(
    Match.value(hasMultipleAutoIncrement),
    Match.when(true, () =>
      Effect.fail(
        new MultipleAutoIncrementError({
          message: `Model '${modelName}' has ${A.length(autoIncrementFields)} autoIncrement fields, but only one is allowed`,
          code: "INV-MODEL-AI-001",
          severity: "error",
          path: [modelName, "autoIncrement"],
          expected: "At most one autoIncrement field per model",
          received: `Fields: ${F.pipe(autoIncrementFields, A.join(", "))}`,
          suggestion: "Remove autoIncrement from all but one field",
          modelName,
          autoIncrementFields,
        })
      )
    ),
    Match.when(false, thunkEffectVoid),
    Match.exhaustive
  );
};

// ============================================================================
// Composed Validators
// ============================================================================

/**
 * Validates a single field's column definition.
 *
 * Runs all field-level validators and returns all errors (error accumulation).
 *
 * @param fieldName - The name of the field
 * @param def - The column definition
 * @param isNullableField - Whether the schema is nullable (from AST analysis)
 * @returns Effect with void on success, array of errors on failure
 *
 * @since 1.0.0
 * @category validators
 */
export const validateField = (
  fieldName: string,
  def: ColumnDef,
  isNullableField = false
): Effect.Effect<void, ReadonlyArray<DSLValidationError>> =>
  Effect.gen(function* () {
    // Run all validations and capture their Either results
    const results = yield* Effect.all([
      Effect.either(validateAutoIncrementType(fieldName, def)),
      Effect.either(validateIdentifierLength(fieldName, [fieldName])),
      Effect.either(validateIdentifierChars(fieldName, [fieldName])),
      Effect.either(validatePrimaryKeyNonNullable(fieldName, def.primaryKey ?? false, isNullableField)),
    ]);

    // Extract failures from the results using filterMap with helper
    const failures: ReadonlyArray<DSLValidationError> = F.pipe(
      results,
      A.filterMap((result) => extractLeft(result as Either.Either<void, DSLValidationError>))
    );

    // If any failures, return them as an array
    if (A.isNonEmptyReadonlyArray(failures)) {
      return yield* Effect.fail(failures as ReadonlyArray<DSLValidationError>);
    }
  });

/**
 * Validates all fields in a model and runs model-level validators.
 *
 * Accumulates all field and model errors into a single array.
 *
 * @param modelName - The model identifier
 * @param columns - Record of column definitions
 * @returns Effect with void on success, array of errors on failure
 *
 * @since 1.0.0
 * @category validators
 */
export const validateModel = (
  modelName: string,
  columns: Record<string, ColumnDef>
): Effect.Effect<void, ReadonlyArray<DSLValidationError>> =>
  Effect.gen(function* () {
    // Run model-level validations and capture their Either results
    const modelResults = yield* Effect.all([
      Effect.either(validateModelIdentifier(modelName)),
      Effect.either(validateIdentifierLength(modelName, ["Model", modelName])),
      Effect.either(validateIdentifierChars(modelName, ["Model", modelName])),
      Effect.either(validateSingleAutoIncrement(modelName, columns)),
    ]);

    // Extract model-level failures using filterMap with helper
    const modelFailures: ReadonlyArray<DSLValidationError> = F.pipe(
      modelResults,
      A.filterMap((result) => extractLeft(result as Either.Either<void, DSLValidationError>))
    );

    // Field-level validations (run for each field)
    const fieldEffects = F.pipe(
      columns,
      Struct.entries,
      A.map(([fieldName, def]) =>
        // Note: isNullable would need to be passed from caller with AST context
        // For now, default to false - full integration would extract from schema AST
        Effect.either(validateField(fieldName, def, false))
      )
    );

    // Run field validations
    const fieldResults = yield* Effect.all(fieldEffects);

    // Extract field-level failures and flatten (each failure is an array of errors)
    const fieldFailures: ReadonlyArray<DSLValidationError> = F.pipe(
      fieldResults,
      A.filterMap((result) => extractLeft(result as Either.Either<void, ReadonlyArray<DSLValidationError>>)),
      A.flatten
    );

    // Combine all errors
    const allErrors = F.pipe(modelFailures, A.appendAll(fieldFailures));

    if (A.isNonEmptyArray(allErrors)) {
      return yield* Effect.fail(allErrors);
    }
  });

// ============================================================================
// Synchronous Validator Wrappers
// ============================================================================

/**
 * Runs field validation synchronously and returns Either.
 * Useful for integration into synchronous Field() factory.
 *
 * @param fieldName - The name of the field
 * @param def - The column definition
 * @param isNullableField - Whether the schema is nullable
 * @returns Either with void on success, error array on failure
 *
 * @since 1.0.0
 * @category utilities
 */
export const validateFieldSync = (
  fieldName: string,
  def: ColumnDef,
  isNullableField = false
):
  | { readonly _tag: "Right"; readonly right: void }
  | { readonly _tag: "Left"; readonly left: ReadonlyArray<DSLValidationError> } =>
  Effect.runSync(Effect.either(validateField(fieldName, def, isNullableField)));

/**
 * Runs model validation synchronously and returns Either.
 * Useful for integration into synchronous Model() factory.
 *
 * @param modelName - The model identifier
 * @param columns - Record of column definitions
 * @returns Either with void on success, error array on failure
 *
 * @since 1.0.0
 * @category utilities
 */
export const validateModelSync = (
  modelName: string,
  columns: Record<string, ColumnDef>
):
  | { readonly _tag: "Right"; readonly right: void }
  | { readonly _tag: "Left"; readonly left: ReadonlyArray<DSLValidationError> } =>
  Effect.runSync(Effect.either(validateModel(modelName, columns)));

/**
 * Checks if validation result is a failure.
 * @since 1.0.0
 * @category utilities
 */
export const isValidationFailure = <E>(
  result: { readonly _tag: "Right"; readonly right: void } | { readonly _tag: "Left"; readonly left: E }
): result is { readonly _tag: "Left"; readonly left: E } => result._tag === "Left";
