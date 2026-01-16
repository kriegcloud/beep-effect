import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as AST from "effect/SchemaAST";

/**
 * Creates a ParseResult.Type issue for missing required fields.
 * Used internally by require* helpers to construct proper parse failures.
 */
const createMissingFieldIssue = (ast: AST.AST, obj: object, key: string): ParseResult.Type =>
  ({
    _tag: "Type",
    ast,
    actual: obj,
    message: `Missing required field: "${key}"`,
  }) as ParseResult.Type;

/**
 * Creates a ParseResult.Type issue for type mismatches.
 * Used internally by require* helpers to construct proper parse failures.
 */
const createTypeIssue = (ast: AST.AST, actual: unknown, message: string): ParseResult.Type =>
  ({
    _tag: "Type",
    ast,
    actual,
    message,
  }) as ParseResult.Type;

/**
 * Converts various date representations to a JavaScript Date object.
 *
 * This helper is used when encoding domain models back to Better Auth format,
 * handling the various ways dates can be represented:
 * - Native Date objects (passed through)
 * - Effect DateTime.Utc instances (converted via DateTime.toDateUtc)
 * - ISO strings or timestamps (converted via Date constructor)
 *
 * @param value - The date value in any supported format
 * @returns A JavaScript Date object
 */
export const toDate = (value: string | number | Date | DateTime.Utc): string => {
  if (value instanceof Date) return DateTime.unsafeFromDate(value).pipe(DateTime.formatIso);
  if (DateTime.isDateTime(value)) return value.pipe(DateTime.formatIso);
  if (P.isNumber(value)) return DateTime.unsafeFromDate(new Date(value)).pipe(DateTime.formatIso);

  return DateTime.unsafeFromDate(new Date(value)).pipe(DateTime.formatIso);
};

// =============================================================================
// REQUIRED FIELD EXTRACTORS
// =============================================================================
// These helpers FAIL with ParseResult.Type if the field is missing from the
// Better Auth response. Use for fields that MUST be present in the response.
//
// This ensures configuration errors (missing plugins, misconfigured schemas)
// surface as parse failures rather than being silently masked by default values.
// =============================================================================

/**
 * Requires a field to be present in the Better Auth object.
 * FAILS with ParseResult.Type if the field is missing.
 *
 * @param obj - The Better Auth object (with Struct + Record extension)
 * @param key - The property key to extract
 * @param ast - The AST node for proper error context
 * @returns Effect that succeeds with the value or fails with ParseResult.Type
 */
export const requireField = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<unknown, ParseResult.Type> => {
  if (!P.hasProperty(obj, key)) {
    return Effect.fail(createMissingFieldIssue(ast, obj, key));
  }
  return Effect.succeed((obj as Record<string, unknown>)[key]);
};

/**
 * Requires a number field to be present in the Better Auth object.
 * FAILS if the field is missing OR if the value is not a number.
 *
 * @param obj - The Better Auth object (with Struct + Record extension)
 * @param key - The property key to extract
 * @param ast - The AST node for proper error context
 * @returns Effect that succeeds with the number or fails with ParseResult.Type
 */
export const requireNumber = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<number, ParseResult.Type> =>
  Effect.gen(function* () {
    const value = yield* requireField(obj, key, ast);
    if (typeof value !== "number") {
      return yield* Effect.fail(createTypeIssue(ast, value, `Field "${key}" must be a number, got ${typeof value}`));
    }
    return value;
  });

/**
 * Requires a string field to be present in the Better Auth object.
 * FAILS if the field is missing.
 * Returns the string value, or null if the value is null/undefined.
 *
 * @param obj - The Better Auth object (with Struct + Record extension)
 * @param key - The property key to extract
 * @param ast - The AST node for proper error context
 * @returns Effect that succeeds with string | null or fails with ParseResult.Type
 */
export const requireString = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<string | null, ParseResult.Type> =>
  Effect.gen(function* () {
    const value = yield* requireField(obj, key, ast);
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value !== "string") {
      return yield* Effect.fail(createTypeIssue(ast, value, `Field "${key}" must be a string, got ${typeof value}`));
    }
    return value;
  });

/**
 * Requires a Date field to be present in the Better Auth object.
 * FAILS if the field is missing.
 * Returns the Date value, or null if the value is null/undefined.
 * Converts string/number representations to Date.
 *
 * @param obj - The Better Auth object (with Struct + Record extension)
 * @param key - The property key to extract
 * @param ast - The AST node for proper error context
 * @returns Effect that succeeds with Date | null or fails with ParseResult.Type
 */
export const requireDate = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<Date | null, ParseResult.Type> =>
  Effect.gen(function* () {
    const value = yield* requireField(obj, key, ast);
    if (value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return yield* Effect.fail(createTypeIssue(ast, value, `Field "${key}" is not a valid date: ${value}`));
      }
      return date;
    }
    return yield* Effect.fail(createTypeIssue(ast, value, `Field "${key}" must be a Date, got ${typeof value}`));
  });

/**
 * Requires a boolean field to be present in the Better Auth object.
 * FAILS if the field is missing.
 * Returns the boolean value. Coerces truthy/falsy values to boolean.
 *
 * @param obj - The Better Auth object (with Struct + Record extension)
 * @param key - The property key to extract
 * @param ast - The AST node for proper error context
 * @returns Effect that succeeds with boolean or fails with ParseResult.Type
 */
export const requireBoolean = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<boolean, ParseResult.Type> =>
  Effect.gen(function* () {
    const value = yield* requireField(obj, key, ast);
    return Boolean(value);
  });
