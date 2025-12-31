import { $SchemaId } from "@beep/identity/packages";
import { thunkFalse } from "@beep/utils";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type * as VariantSchema from "../../../core/VariantSchema";
import type { ModelVariant } from "./literals.ts";
import { ColumnType } from "./literals.ts";

const $I = $SchemaId.create("integrations/sql/dsl/types");

// ============================================================================
// Schema/Column Type Compatibility Validation
// ============================================================================

/**
 * Maps ColumnType to compatible TypeScript types.
 * Used for compile-time validation of schema/column compatibility.
 * @since 1.0.0
 * @category type-level
 */

type JsonPrimitive = string | number | boolean | null;
type JsonArray = readonly JsonValue[];
type JsonObject = { readonly [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonArray | JsonObject;

/**
 * The type that JSON columns can accept for schema/column compatibility checking.
 * Uses `object | readonly unknown[]` to be permissive - any object or array structure
 * is valid for JSON columns. This allows struct schemas with arbitrary value types
 * (like `{ preferences: Record<string, unknown> }`) to be compatible with "json" columns.
 * @internal
 */
type JsonColumnAccepts = object | readonly unknown[];

export interface ColumnTypeConfig {
  readonly string: { readonly output: string; readonly accepts: string };
  readonly uuid: { readonly output: string; readonly accepts: string };
  readonly number: { readonly output: number; readonly accepts: number };
  readonly integer: { readonly output: number; readonly accepts: number };
  readonly boolean: { readonly output: boolean; readonly accepts: boolean };
  readonly datetime: { readonly output: string | Date; readonly accepts: string | Date };
  readonly json: { readonly output: unknown; readonly accepts: JsonColumnAccepts };
  readonly bigint: { readonly output: bigint; readonly accepts: bigint };
}

export type ColumnTypeToTS<T extends ColumnType.Type> = ColumnTypeConfig[T]["output"];

/**
 * Maps TypeScript types to their compatible ColumnTypes.
 * Used to provide helpful error messages showing allowed column types.
 * @since 1.0.0
 * @category type-level
 */
export type TSToColumnTypes<T> = {
  readonly [K in ColumnType.Type]: [T] extends [ColumnTypeConfig[K]["accepts"]] ? K : never;
}[ColumnType.Type];

/**
 * Strips `null` and `undefined` from a type to get the non-nullable base type.
 * Used to handle nullable schema types in compatibility checks.
 * @since 1.0.0
 * @category type-level
 */
export type StripNullable<T> = T extends null | undefined ? never : T;

/**
 * Checks if a schema's encoded type is compatible with a column type.
 * Returns `true` if compatible, `false` otherwise.
 *
 * Uses the `accepts` property from `ColumnTypeConfig` for a single source of truth.
 * This check is lenient with nullable types: if the base type (excluding null/undefined)
 * is compatible with the column type, the check passes. This allows nullable columns
 * (e.g., `S.NullOr(S.String)` encoding to `string | null`) to work with their base column type.
 *
 * @since 1.0.0
 * @category type-level
 */
export type IsSchemaColumnCompatible<SchemaEncoded, ColType extends ColumnType.Type> = [
  // Handle case where SchemaEncoded is just null/undefined
  StripNullable<SchemaEncoded>,
] extends [never]
  ? false
  : // Use ColumnTypeConfig as single source of truth for type compatibility
    [StripNullable<SchemaEncoded>] extends [ColumnTypeConfig[ColType]["accepts"]]
    ? true
    : false;

/**
 * Config for pretty-printing TypeScript types in error messages.
 * Maps type categories to their display names.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface PrettyPrintConfig {
  readonly string: "string";
  readonly number: "number";
  readonly boolean: "boolean";
  readonly Date: "Date";
  readonly Array: "Array";
  readonly object: "object";
}

/**
 * Pretty-prints a TypeScript type for error messages.
 *
 * Uses precedence-aware checking since types overlap:
 * - Date must be checked before object (Date extends object)
 * - Array must be checked before object (arrays are objects)
 * - Primitives (string, number, boolean) are checked first
 *
 * @since 1.0.0
 * @category type-level
 */
export type PrettyPrintType<T> =
  // Primitives first (no overlap issues)
  [T] extends [string]
    ? PrettyPrintConfig["string"]
    : [T] extends [number]
      ? PrettyPrintConfig["number"]
      : [T] extends [boolean]
        ? PrettyPrintConfig["boolean"]
        : // Date before object (Date extends object)
          [T] extends [Date]
          ? PrettyPrintConfig["Date"]
          : // Array before object (arrays are objects)
            [T] extends [readonly unknown[]]
            ? PrettyPrintConfig["Array"]
            : // Generic object
              [T] extends [object]
              ? PrettyPrintConfig["object"]
              : "unknown";

/**
 * Error type returned when schema encoded type is incompatible with column type.
 * This branded type prevents usage and provides a descriptive error message.
 * @since 1.0.0
 * @category errors
 */
export interface SchemaColumnError<SchemaEncoded, ColType extends ColumnType.Type> {
  readonly _tag: "SchemaColumnTypeError";
  readonly _brand: "SchemaColumnTypeError";
  readonly message: `Schema encoded type '${PrettyPrintType<SchemaEncoded>}' is incompatible with column type '${ColType}'. Allowed column types for this schema: ${TSToColumnTypes<SchemaEncoded>}`;
  readonly schemaType: SchemaEncoded;
  readonly columnType: ColType;
  readonly allowedColumnTypes: TSToColumnTypes<SchemaEncoded>;
}

/**
 * Validates schema/column compatibility and returns either the valid result type or an error type.
 * @since 1.0.0
 * @category type-level
 */
export type ValidateSchemaColumn<SchemaEncoded, ColType extends ColumnType.Type, ResultType> = IsSchemaColumnCompatible<
  SchemaEncoded,
  ColType
> extends true
  ? ResultType
  : SchemaColumnError<SchemaEncoded, ColType>;

// ============================================================================
// Schema Type Extraction Helpers
// ============================================================================

/**
 * Extracts the Encoded type (I) from a Schema or PropertySignature.
 * Returns `unknown` if neither pattern matches.
 *
 * This is a foundational helper used throughout the DSL type system to extract
 * the wire/database representation type from Effect schemas.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
export type InferEncodedType<T> = [T] extends [S.Schema<infer _A, infer I, infer _R>]
  ? I
  : [T] extends [S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>]
    ? I
    : unknown;

/**
 * Extracts the Type (A) from a Schema or PropertySignature.
 * Returns `unknown` if neither pattern matches.
 *
 * This is a foundational helper used to extract the decoded/runtime type
 * from Effect schemas.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
export type InferTypeType<T> = [T] extends [S.Schema<infer A, infer _I, infer _R>]
  ? A
  : [T] extends [S.PropertySignature<infer _TT, infer T, infer _K, infer _ET, infer _I, infer _HD, infer _C>]
    ? T
    : unknown;

/**
 * Extracts the Context/Requirements type (R) from a Schema or PropertySignature.
 * Returns `never` if neither pattern matches.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
export type InferContextType<T> = [T] extends [S.Schema<infer _A, infer _I, infer R>]
  ? R
  : [T] extends [S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer _I, infer _HD, infer C>]
    ? C
    : never;

/**
 * Extracts the encoded type from a VariantSchema.Field's "select" variant.
 * Used for column compatibility validation of variant fields.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractVariantSelectEncoded<VC> = VC extends { readonly select: infer SelectSchema }
  ? InferEncodedType<SelectSchema>
  : unknown;

/**
 * Checks if a type is a Schema or PropertySignature and returns it, otherwise returns `unknown`.
 * Used when we need to validate that a type is schema-like before using it.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
export type AsSchemaLike<T> = [T] extends [S.Schema<infer _A, infer _I, infer _R>]
  ? T
  : [T] extends [S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer _I, infer _HD, infer _C>]
    ? T
    : unknown;

/**
 * Extracts the schema type from a VariantSchema.Field's "select" variant.
 * Used for schema-level column type derivation of variant fields.
 *
 * For `M.Generated(S.Int)`, this extracts `S.Int` (the inner schema).
 * For `M.FieldOption(S.UUID)`, this extracts the inner schema from `OptionFromNullOr<S.UUID>`.
 *
 * @since 1.0.0
 * @category type-level
 */
export type ExtractVariantSelectSchema<VC> = VC extends { readonly select: infer SelectSchema }
  ? AsSchemaLike<SelectSchema>
  : unknown;

// ============================================================================
// Type-Level Column Type Derivation
// ============================================================================

/**
 * Helper type to check if a type is `any`.
 * Uses the property that `any & 1` is `0` extends it, but no other type is.
 * @internal
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Helper type to check if a type is `unknown`.
 * `unknown` is the top type, so `string extends unknown` is true for all types,
 * but only `unknown` has `unknown extends T` as true (besides `any`).
 * @internal
 */
type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

// ============================================================================
// Field Category Helper Analysis (NOT IMPLEMENTED)
// ============================================================================
//
// Considered but rejected: A unified `FieldCategory<F>` helper type to categorize
// DSL fields. Analysis showed this would ADD complexity rather than reduce it:
//
// 1. **Different check orders**: `FieldResult` checks VariantSchema.Field first,
//    while `ShouldIncludeField` and `ExtractFieldSchema` check DSLVariantField first.
//    A unified category would force incorrect ordering in some consumers.
//
// 2. **Different return requirements**:
//    - `ShouldIncludeField`: Returns boolean, needs variant key membership check
//    - `ExtractFieldSchema`: Extracts and returns the schema type from each category
//    - `FieldResult`: Wraps input in DSLField/DSLVariantField with ColumnDef
//
//    Each type needs to extract different type parameters at each conditional branch.
//    A category string can't carry these extracted parameters forward.
//
// 3. **Line count analysis**:
//    - Current approach: ~35 lines total across 3 types
//    - With FieldCategory + config: ~50+ lines (helper + config + still-complex consumers)
//
// 4. **IsExactlyObject<T>** helper was also considered for the pattern:
//    `[A] extends [object] ? [object] extends [A] ? ... : ...`
//    Only 1 usage site found. Adding 5-line helper to save 1 line is not justified.
//
// The current approach, while appearing repetitive, is actually more maintainable
// because each type's conditional logic is self-contained and optimized for its
// specific use case. The apparent duplication is superficial - the logic differs
// in ordering, return types, and extracted type parameters.
// ============================================================================

/**
 * Config for deriving column types from encoded TypeScript types.
 * Maps TypeScript type categories to their corresponding ColumnType.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface EncodedTypeConfig {
  readonly date: "datetime";
  readonly array: "json";
  readonly object: "json";
  readonly string: "string";
  readonly number: "number";
  readonly boolean: "boolean";
  readonly bigint: "bigint";
}

/**
 * Derives the SQL column type from a TypeScript type.
 * Uses `EncodedTypeConfig` as the source of truth.
 *
 * Precedence order (critical for correct type matching):
 * 1. Date before object (Date extends object)
 * 2. Array before object (arrays are objects)
 * 3. Primitives (string, number, boolean, bigint) - must come before object
 *    because branded types like `string & Brand<"X">` are intersections with object
 * 4. Object (structs, records) - AFTER primitives
 * 5. Fallback to full ColumnType.Type union
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
type DeriveColumnTypeFromTSType<T> =
  // Date must be checked before object (Date extends object)
  [T] extends [Date]
    ? EncodedTypeConfig["date"]
    : // Arrays map to json (check before object since arrays are objects)
      [T] extends [readonly unknown[]]
      ? EncodedTypeConfig["array"]
      : // Primitives - check BEFORE object (branded types are primitive & object intersections)
        [T] extends [string]
        ? EncodedTypeConfig["string"]
        : [T] extends [number]
          ? EncodedTypeConfig["number"]
          : [T] extends [boolean]
            ? EncodedTypeConfig["boolean"]
            : [T] extends [bigint]
              ? EncodedTypeConfig["bigint"]
              : // Object types (structs, records) map to json
                [T] extends [object]
                ? EncodedTypeConfig["object"]
                : // Fallback for unknown types
                  ColumnType.Type;

/**
 * Helper type that derives column type from a non-nullable type.
 * Alias for `DeriveColumnTypeFromTSType` - kept for internal consistency.
 * @internal
 */
type DeriveFromStrippedType<T> = DeriveColumnTypeFromTSType<T>;

/**
 * Derives the SQL column type from a schema's encoded TypeScript type.
 *
 * This provides type-level inference that mirrors the runtime `deriveColumnType` function.
 * The mapping is based on the encoded type (what gets stored in the database):
 *
 * - `any`/`unknown` → `"json"` (catch-all types, handled first to prevent false matches)
 * - `Date` → `"datetime"` (checked before object since Date extends object)
 * - `readonly unknown[]` → `"json"` (arrays)
 * - `object` → `"json"` (structs, records)
 * - `string` → `"string"` (includes UUID at runtime, but type-level can't distinguish)
 * - `number` → `"number"` (includes Int at runtime, but type-level can't distinguish)
 * - `boolean` → `"boolean"`
 * - `bigint` → `"bigint"`
 *
 * Uses `EncodedTypeConfig` as single source of truth for type mappings.
 *
 * **Note**: This is a fallback for when schema identity cannot be determined.
 * Prefer `DeriveColumnTypeFromSchema` when the schema type is available.
 *
 * @since 1.0.0
 * @category type-level
 */
export type DeriveColumnTypeFromEncoded<I> =
  // Handle `any` type first - `any` matches everything including Date, so it must be checked first
  IsAny<I> extends true
    ? "json"
    : // Handle `unknown` type
      IsUnknown<I> extends true
      ? "json"
      : // Handle nullable types by stripping null/undefined first
        [StripNullable<I>] extends [never]
        ? ColumnType.Type // Pure null/undefined - fall back to full union
        : // Derive from the stripped type using config-based helper
          DeriveFromStrippedType<StripNullable<I>>;

// ============================================================================
// Schema-Level Column Type Derivation (via Class Identity)
// ============================================================================

/**
 * Extracts the inner schema from NullOr/OptionFromNullOr wrappers.
 * Used to unwrap nullable schemas to get to the underlying type for derivation.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
type UnwrapNullable<Schema> =
  // Check for NullOr pattern: Union with null literal
  Schema extends S.NullOr<infer Inner> ? Inner : Schema;

/**
 * Derives the SQL column type from an Effect Schema type using class identity.
 *
 * This provides more precise type-level inference than `DeriveColumnTypeFromEncoded`
 * by checking the schema's class identity rather than just its encoded type.
 *
 * **Supported refined types:**
 * - `S.Int` → `"integer"` (not just `"number"`)
 * - `S.UUID` → `"uuid"` (not just `"string"`)
 * - `S.ULID` → `"uuid"` (not just `"string"`)
 * - `S.Date` → `"datetime"`
 * - `S.DateFromString` → `"datetime"`
 * - `S.BigInt` → `"bigint"` (from string)
 * - `S.DateTimeUtc` → `"datetime"`
 *
 * Falls back to `DeriveColumnTypeFromEncoded` for unknown schema types.
 *
 * @since 1.0.0
 * @category type-level
 */
export type DeriveColumnTypeFromSchema<Schema> =
  // First unwrap any NullOr wrapper to get the inner schema
  DeriveColumnTypeFromSchemaInner<UnwrapNullable<Schema>>;

/**
 * Inner derivation logic after unwrapping nullable wrappers.
 *
 * ## CRITICAL: Detecting S.Any and S.Unknown
 *
 * Due to TypeScript's variance behavior with `any`, using `Schema extends typeof S.Any`
 * would match ALL schemas (because S.Any's type parameters are `any`, which is bivariant).
 *
 * Instead, we detect S.Any by checking if the schema's TYPE PARAMETER is `any` using
 * the `IsAny` helper. Similarly, we detect S.Unknown by checking if the type is `unknown`.
 *
 * The ordering of checks follows this priority:
 * 1. Extract schema type parameters and check for any/unknown/object
 * 2. Refined types (Int, UUID, ULID) - before their base types
 * 3. Transformation types (Date, DateFromString, DateTimeUtc, BigInt)
 * 4. Number refinements (Positive, Negative, etc.)
 * 5. Fallback to encoded type derivation
 *
 * IMPORTANT: We check against `typeof S.Int` etc. because when a schema class
 * is passed to Field(), the type parameter captures the constructor type (typeof Class),
 * not the instance type (Class).
 *
 * @internal
 */
type DeriveColumnTypeFromSchemaInner<Schema> =
  // First extract the Type parameter to check for any/unknown
  Schema extends S.Schema<infer A, infer _I, infer _R>
    ? // Check if Type is `any` (S.Any case) using the IsAny helper
      IsAny<A> extends true
      ? "json"
      : // Check if Type is `unknown` (S.Unknown case)
        IsUnknown<A> extends true
        ? "json"
        : // Check if Type is `object` (S.Object case)
          [A] extends [object]
          ? [object] extends [A]
            ? "json" // Only matches when A is exactly `object`, not subtypes
            : // Not exactly `object`, continue with other checks
              DeriveColumnTypeFromSchemaSpecific<Schema, A>
          : // Not object, continue with other checks
            DeriveColumnTypeFromSchemaSpecific<Schema, A>
    : // Not a schema, fallback
      ColumnType.Type;

/**
 * Config mapping Effect Schema types to their corresponding ColumnType.
 *
 * This provides a single source of truth for schema-to-column-type mappings.
 * The config is organized by category for maintainability.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface SchemaTypeConfig {
  // Integer type (refined from number)
  readonly Int: "integer";
  // Number refinements (still number, not integer)
  readonly Positive: "number";
  readonly Negative: "number";
  readonly NonPositive: "number";
  readonly NonNegative: "number";
  // UUID/ULID types (refined from string)
  readonly UUID: "uuid";
  readonly ULID: "uuid";
  // DateTime types (transformations)
  readonly DateFromString: "datetime";
  readonly Date: "datetime";
  readonly DateTimeUtc: "datetime";
  readonly DateTimeUtcFromSelf: "datetime";
  // BigInt types (transformations)
  readonly BigInt: "bigint";
  readonly BigIntFromSelf: "bigint";
}

/**
 * Maps config keys to their corresponding Effect Schema types.
 * Used for reverse lookup: Schema -> Config Key.
 * @internal
 */
interface SchemaTypeMapping {
  readonly Int: typeof S.Int;
  readonly Positive: typeof S.Positive;
  readonly Negative: typeof S.Negative;
  readonly NonPositive: typeof S.NonPositive;
  readonly NonNegative: typeof S.NonNegative;
  readonly UUID: typeof S.UUID;
  readonly ULID: typeof S.ULID;
  readonly DateFromString: typeof S.DateFromString;
  readonly Date: typeof S.Date;
  readonly DateTimeUtc: typeof S.DateTimeUtc;
  readonly DateTimeUtcFromSelf: typeof S.DateTimeUtcFromSelf;
  readonly BigInt: typeof S.BigInt;
  readonly BigIntFromSelf: typeof S.BigIntFromSelf;
}

/**
 * Extracts the config key for a known schema type using distributive key remapping.
 * Returns `never` if the schema doesn't match any known type.
 * @internal
 */
type SchemaToConfigKey<Schema> = {
  readonly [K in keyof SchemaTypeMapping]: Schema extends SchemaTypeMapping[K] ? K : never;
}[keyof SchemaTypeMapping];

/**
 * Derives column type from specific schema types after ruling out any/unknown/object.
 *
 * Uses `SchemaTypeConfig` and `SchemaTypeMapping` for config-based lookup of known schemas.
 * Falls back to recursion for generic filters, refinements, and transformations.
 *
 * @internal
 */
type DeriveColumnTypeFromSchemaSpecific<Schema, A> =
  // Try direct config lookup for known schema types
  // First check if the key is not `never` (schema matches a known type)
  [SchemaToConfigKey<Schema>] extends [never]
    ? // Schema not in mapping - check generic patterns
      // Generic refinements/filters - recurse to inner type
      Schema extends S.filter<infer Inner>
      ? DeriveColumnTypeFromSchemaInner<Inner>
      : Schema extends S.refine<infer _A2, infer From>
        ? DeriveColumnTypeFromSchemaInner<From>
        : // Generic transformations - recurse to encoded side
          Schema extends S.transform<infer From, infer _To>
          ? DeriveColumnTypeFromSchemaInner<From>
          : Schema extends S.transformOrFail<infer From, infer _To, infer _R2>
            ? DeriveColumnTypeFromSchemaInner<From>
            : // Fallback to Type parameter derivation
              DeriveFromTypeParameter<A>
    : // Schema matches a known type - lookup in config
      SchemaTypeConfig[SchemaToConfigKey<Schema>];

/**
 * Derives column type from the schema's Type parameter (A).
 * Used as a fallback when schema-specific checks don't match.
 *
 * Alias for `DeriveColumnTypeFromTSType` - the logic is identical since both
 * derive column types from TypeScript types using the same precedence rules.
 *
 * @see DeriveColumnTypeFromTSType for precedence order documentation
 * @internal
 */
type DeriveFromTypeParameter<A> = DeriveColumnTypeFromTSType<A>;

/**
 * Extracts column definition properties from a partial config.
 * Excludes the `type` property which must be provided separately.
 *
 * This is a helper type used by both `ExactColumnDef` and `DerivedColumnDefFromSchema`
 * to avoid duplicating the property extraction logic.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
type ExtractColumnDefProps<C extends Partial<ColumnDef>> = {
  readonly primaryKey: C extends { readonly primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { readonly unique: infer U extends boolean } ? U : false;
  readonly autoIncrement: C extends { readonly autoIncrement: infer AI extends boolean } ? AI : false;
  readonly default?: C extends { readonly default: infer D extends string } ? D : undefined;
  readonly $default?: C extends { readonly $default: infer DF } ? DF : undefined;
  readonly $defaultFn?: C extends { readonly $defaultFn: infer DFn } ? DFn : undefined;
  readonly $onUpdate?: C extends { readonly $onUpdate: infer OU } ? OU : undefined;
  readonly $onUpdateFn?: C extends { readonly $onUpdateFn: infer OUFn } ? OUFn : undefined;
};

/**
 * Creates a ColumnDef with the type derived from the schema's class identity.
 * Used when no explicit column type is provided in the config.
 *
 * This version uses schema-level derivation for more precise type inference,
 * correctly distinguishing `S.Int` from `S.Number`, `S.UUID` from `S.String`, etc.
 *
 * @since 1.0.0
 * @category type-level
 */
export type DerivedColumnDefFromSchema<Schema, C extends Partial<ColumnDef>> = {
  readonly type: DeriveColumnTypeFromSchema<Schema>;
} & ExtractColumnDefProps<C>;

/**
 * Schema for static SQL default value (string).
 * @internal
 */
const defaultSchema = S.optionalWith(S.String, { exact: true });

/**
 * Schema for runtime default function.
 * @internal
 */
const runtimeFunctionSchema = S.optionalWith(
  S.declare((u: unknown): u is () => unknown => F.isFunction(u)),
  { exact: true }
);

// ============================================================================
// Column Definition Schema Factories
// ============================================================================

/**
 * Base factory for column definitions WITHOUT autoIncrement.
 * Used by: string, number, boolean, datetime, uuid, json
 *
 * Per INV-SQL-AI-001: autoIncrement requires integer or bigint type.
 * Types that don't support autoIncrement simply don't have the property.
 */
const baseColumnDefFactory = ColumnType.toTagged("type").composer({
  primaryKey: S.optionalWith(S.Boolean, { exact: true, default: thunkFalse }),
  unique: S.optionalWith(S.Boolean, { exact: true, default: thunkFalse }),
});

/**
 * Factory for column definitions WITH autoIncrement support.
 * Used by: integer, bigint
 *
 * Per INV-SQL-AI-001: only integer and bigint types support autoIncrement.
 */
const autoIncrementColumnDefFactory = ColumnType.toTagged("type").composer({
  primaryKey: S.optionalWith(S.Boolean, { exact: true, default: thunkFalse }),
  unique: S.optionalWith(S.Boolean, { exact: true, default: thunkFalse }),
  autoIncrement: S.optionalWith(S.Boolean, { exact: true, default: thunkFalse }),
});

export class StringColumnDefSchema extends baseColumnDefFactory
  .string({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("StringColumnDefSchema", {
      description: "String column definition",
    })
  ) {}

export declare namespace StringColumnDefSchema {
  export type Type = typeof StringColumnDefSchema.Type;
  export type Encoded = typeof StringColumnDefSchema.Encoded;
}

export class NumberColumnDefSchema extends baseColumnDefFactory
  .number({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("NumberColumnDefSchema", {
      description: "Number column definition",
    })
  ) {}

export declare namespace NumberColumnDefSchema {
  export type Type = typeof NumberColumnDefSchema.Type;
  export type Encoded = typeof NumberColumnDefSchema.Encoded;
}

export class IntegerColumnDefSchema extends autoIncrementColumnDefFactory
  .integer({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("IntegerColumnDefSchema", {
      description: "Integer column definition",
    })
  ) {}

export declare namespace IntegerColumnDefSchema {
  export type Type = typeof IntegerColumnDefSchema.Type;
  export type Encoded = typeof IntegerColumnDefSchema.Encoded;
}

export class BooleanColumnDefSchema extends baseColumnDefFactory
  .boolean({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("BooleanColumnDefSchema", {
      description: "Boolean column definition",
    })
  ) {}

export declare namespace BooleanColumnDefSchema {
  export type Type = typeof BooleanColumnDefSchema.Type;
  export type Encoded = typeof BooleanColumnDefSchema.Encoded;
}

export class DatetimeColumnDefSchema extends baseColumnDefFactory
  .datetime({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("DatetimeColumnDefSchema", {
      description: "Datetime column definition",
    })
  ) {}

export declare namespace DatetimeColumnDefSchema {
  export type Type = typeof DatetimeColumnDefSchema.Type;
  export type Encoded = typeof DatetimeColumnDefSchema.Encoded;

  /**
   * Generic interface for datetime column definitions.
   *
   * @remarks
   * Datetime columns do not support autoIncrement per INV-SQL-AI-001.
   */
  export interface Generic<PrimaryKey extends boolean = boolean, Unique extends boolean = boolean> {
    readonly type: Type["type"];
    readonly primaryKey?: PrimaryKey | undefined;
    readonly unique?: Unique | undefined;
    readonly default?: Type["default"];
    readonly $default?: Type["$default"];
    readonly $defaultFn?: Type["$defaultFn"];
    readonly $onUpdate?: Type["$onUpdate"];
    readonly $onUpdateFn?: Type["$onUpdateFn"];
  }
}

export class UuidColumnDefSchema extends baseColumnDefFactory
  .uuid({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("UuidColumnDefSchema", {
      description: "UUID column definition",
    })
  ) {}

export declare namespace UuidColumnDefSchema {
  export type Type = typeof UuidColumnDefSchema.Type;
  export type Encoded = typeof UuidColumnDefSchema.Encoded;
}

export class JsonColumnDefSchema extends baseColumnDefFactory
  .json({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("JsonColumnDefSchema", {
      description: "JSON column definition",
    })
  ) {}

export declare namespace JsonColumnDefSchema {
  export type Type = typeof JsonColumnDefSchema.Type;
  export type Encoded = typeof JsonColumnDefSchema.Encoded;
}

export class BigintColumnDefSchema extends autoIncrementColumnDefFactory
  .bigint({
    default: defaultSchema,
    $default: runtimeFunctionSchema,
    $defaultFn: runtimeFunctionSchema,
    $onUpdate: runtimeFunctionSchema,
    $onUpdateFn: runtimeFunctionSchema,
  })
  .annotations(
    $I.annotations("BigintColumnDefSchema", {
      description: "Bigint column definition",
    })
  ) {}

export declare namespace BigintColumnDefSchema {
  export type Type = typeof BigintColumnDefSchema.Type;
  export type Encoded = typeof BigintColumnDefSchema.Encoded;
}

export class ColumnDefSchema extends S.Union(
  StringColumnDefSchema,
  NumberColumnDefSchema,
  IntegerColumnDefSchema,
  BooleanColumnDefSchema,
  DatetimeColumnDefSchema,
  UuidColumnDefSchema,
  JsonColumnDefSchema,
  BigintColumnDefSchema
).annotations(
  $I.annotations("ColumnDefSchema", {
    description: "Column definition schema",
  })
) {}

export declare namespace ColumnDefSchema {
  export type Type = typeof ColumnDefSchema.Type;
  export type Encoded = typeof ColumnDefSchema.Encoded;
}

// Generic ColumnDef preserves specific literals
// Note: `nullable` has been removed - nullability is derived from the Effect Schema AST
// Note: Using `| undefined` on optional properties for exactOptionalPropertyTypes compatibility
export interface ColumnDef<
  ColType extends ColumnType.Type = ColumnType.Type,
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> {
  readonly type: ColType;
  readonly primaryKey?: PrimaryKey | undefined;
  readonly unique?: Unique | undefined;
  readonly autoIncrement?: AutoIncrement | undefined;
  /**
   * Static SQL default value evaluated by the database.
   * @example 'now()', "'active'", '1'
   */
  readonly default?: string | undefined;
  /**
   * Alias for `$defaultFn` - runtime function called by Drizzle on INSERT.
   */
  readonly $default?: (() => unknown) | undefined;
  /**
   * Runtime function called by Drizzle on INSERT when value is undefined.
   * @example () => crypto.randomUUID()
   */
  readonly $defaultFn?: (() => unknown) | undefined;
  /**
   * Alias for `$onUpdateFn` - runtime function called by Drizzle on UPDATE.
   */
  readonly $onUpdate?: (() => unknown) | undefined;
  /**
   * Runtime function called by Drizzle on UPDATE when value is undefined.
   * Also used on INSERT if no `$defaultFn` is provided.
   * @example () => new Date().toISOString()
   */
  readonly $onUpdateFn?: (() => unknown) | undefined;
}

export declare namespace ColumnDef {
  export interface Any {
    readonly type: ColumnType.Type;
    readonly primaryKey?: boolean | undefined;
    readonly unique?: boolean | undefined;
    readonly autoIncrement?: boolean | undefined;
    readonly default?: string | undefined;
    readonly $default?: (() => unknown) | undefined;
    readonly $defaultFn?: (() => unknown) | undefined;
    readonly $onUpdate?: (() => unknown) | undefined;
    readonly $onUpdateFn?: (() => unknown) | undefined;
  }
}

// Helper to create exact ColumnDef from partial config
// Note: `nullable` has been removed - nullability is derived from the Effect Schema AST
// When no explicit type is given, use ColumnType.Type union (runtime derives the actual type)
export type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { readonly type: infer T extends ColumnType.Type } ? T : ColumnType.Type;
} & ExtractColumnDefProps<C>;

export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
  readonly references?: FieldReference;
}

// Annotation symbol - use Symbol.for for cross-module consistency
export const ColumnMetaSymbol: unique symbol = Symbol.for($I`column-meta`);
export type ColumnMetaSymbol = typeof ColumnMetaSymbol;

// Symbol for detecting DSL variant fields
export const VariantFieldSymbol: unique symbol = Symbol.for($I`variant-field`);
export type VariantFieldSymbol = typeof VariantFieldSymbol;

/**
 * DSLField wraps a plain Schema with column metadata.
 * @since 1.0.0
 */
export interface DSLField<A, I = A, R = never, C extends ColumnDef = ColumnDef> extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
}

export type WithColumnDef = {
  <A, I = A, R = never, C extends ColumnDef = ColumnDef>(
    columnDef: ColumnDef
  ): (self: S.Schema<A, I, R>) => DSLField<A, I, R, C>;
  <A, I = A, R = never, C extends ColumnDef = ColumnDef>(
    self: S.Schema<A, I, R>,
    columnDef: ColumnDef
  ): DSLField<A, I, R, C>;
};

/**
 * DSLVariantField wraps a VariantSchema.Field with column metadata.
 * Carries BOTH column metadata AND variant config for multi-variant models.
 * @since 1.0.0
 */
export interface DSLVariantField<A extends VariantSchema.Field.Config, C extends ColumnDef = ColumnDef>
  extends VariantSchema.Field<A> {
  readonly [ColumnMetaSymbol]: C;
  readonly [VariantFieldSymbol]: true;
}

/**
 * DSL namespace containing field type definitions.
 * Uses a wider type constraint than S.Struct.Fields to include DSLVariantField and VariantSchema.Field.
 * This mirrors VariantSchema.Struct.Fields pattern.
 * @since 1.0.0
 * @category models
 */
export declare namespace DSL {
  /**
   * Fields type that includes all valid field types for DSL models.
   * Unlike S.Struct.Fields, this includes DSLVariantField and raw VariantSchema.Field types.
   * Uses `any` for variant config types to preserve specific field configurations during inference.
   * @since 1.0.0
   */
  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | DSLField<any, any, any>
      | DSLVariantField<any>
      | VariantSchema.Field<any>
      | undefined;
  };
}

/**
 * Type guard to check if a value is a DSLVariantField.
 * @since 1.0.0
 */
export const isDSLVariantField = <A extends VariantSchema.Field.Config, C extends ColumnDef>(
  u: unknown
): u is DSLVariantField<A, C> =>
  u !== null &&
  typeof u === "object" &&
  VariantFieldSymbol in u &&
  (u as Record<symbol, unknown>)[VariantFieldSymbol] === true;

/**
 * Conditional return type for Field factory.
 * Determines the appropriate return type based on input type.
 * @since 1.0.0
 */
export type FieldResult<Input, C extends ColumnDef> = Input extends VariantSchema.Field<infer VariantConfig>
  ? DSLVariantField<VariantConfig, C>
  : Input extends S.Schema<infer A, infer I, infer R>
    ? DSLField<A, I, R, C>
    : Input extends S.PropertySignature<
          infer _TypeToken,
          infer Type,
          infer _Key,
          infer _EncodedToken,
          infer Encoded,
          infer _HasDefault,
          infer Context
        >
      ? DSLField<Type, Encoded, Context, C>
      : never;

// ============================================================================
// Variant Extraction Types
// ============================================================================

/**
 * Extracts fields for a specific variant from DSL fields.
 * - DSLVariantField / VariantSchema.Field: Include field only if variant is in its config
 * - DSLField / Plain Schema: Include in all variants
 * Uses DSL.Fields constraint which is wider than S.Struct.Fields.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractVariantFields<V extends ModelVariant.Type, Fields extends DSL.Fields> = {
  readonly [K in keyof Fields as ShouldIncludeField<V, Fields[K]> extends true ? K : never]: ExtractFieldSchema<
    V,
    Fields[K]
  >;
};

/**
 * Determines if a field should be included in a specific variant.
 * Uses tuple wrapping to prevent distributive conditional types.
 * Checks for DSLVariantField (has column metadata) and raw VariantSchema.Field.
 * Uses unconstrained infer to preserve specific config types.
 * @since 1.0.0
 * @category type-level
 */
export type ShouldIncludeField<V extends string, F> = [F] extends [DSLVariantField<infer Config, any>] // Check DSLVariantField wrapper (has column metadata) - use any for ColumnDef to avoid matching issues
  ? V extends keyof Config
    ? true
    : false
  : // Check raw VariantSchema.Field (from @effect/experimental or @effect/sql/Model)
    [F] extends [VariantSchema.Field<infer Config>]
    ? V extends keyof Config
      ? true
      : false
    : // Plain DSLField/Schema included in all variants
      true;

/**
 * Extracts the schema type for a field in a specific variant.
 * Uses tuple wrapping to prevent distributive conditional types.
 * Guards V extends keyof Config before accessing Config[V] for safety.
 * Handles DSLVariantField, raw VariantSchema.Field, DSLField, and plain Schema.
 * Uses unconstrained infer (any) for ColumnDef to preserve specific config types.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractFieldSchema<V extends string, F> = [F] extends [DSLVariantField<infer Config, any>] // DSLVariantField (has column metadata) - use any for ColumnDef to avoid matching issues
  ? V extends keyof Config // Guard FIRST
    ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All] // THEN safe access
      ? Config[V]
      : never
    : never
  : // Raw VariantSchema.Field (from @effect/experimental or @effect/sql/Model)
    [F] extends [VariantSchema.Field<infer Config>]
    ? V extends keyof Config
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]
        ? Config[V]
        : never
      : never
    : // DSLField (plain schema with column metadata) - use any for ColumnDef
      [F] extends [DSLField<infer A, infer I, infer R, any>]
      ? S.Schema<A, I, R>
      : // Plain Schema
        [F] extends [S.Schema.All]
        ? F
        : // PropertySignature
          [F] extends [S.PropertySignature.All]
          ? F
          : never;

/**
 * Helper type to compute the select variant's schema fields from DSL.Fields.
 * Used for the base class schema operations.
 * @since 1.0.0
 * @category type-level
 */
export type SelectVariantFields<Fields extends DSL.Fields> = S.Simplify<ExtractVariantFields<"select", Fields>>;

/**
 * Model class interface that includes 6 variant schema accessors.
 * Uses intersection pattern: BaseClass & VariantAccessors.
 * TName and Id are string types that preserve literal table names.
 * @since 1.0.0
 * @category models
 */
export interface ModelClassWithVariants<
  Self,
  Fields extends DSL.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  Relations extends RelationsConfig = RelationsConfig,
> extends ModelClass<Self, Fields, TName, Columns, PK, Id, Relations> {
  /** Schema for SELECT queries - all fields */
  readonly select: S.Struct<S.Simplify<ExtractVariantFields<"select", Fields>>>;
  /** Schema for INSERT operations - excludes Generated fields */
  readonly insert: S.Struct<S.Simplify<ExtractVariantFields<"insert", Fields>>>;
  /** Schema for UPDATE operations - all fields */
  readonly update: S.Struct<S.Simplify<ExtractVariantFields<"update", Fields>>>;
  /** Schema for JSON output - excludes Sensitive fields */
  readonly json: S.Struct<S.Simplify<ExtractVariantFields<"json", Fields>>>;
  /** Schema for JSON create input - excludes Generated, GeneratedByApp, and Sensitive fields */
  readonly jsonCreate: S.Struct<S.Simplify<ExtractVariantFields<"jsonCreate", Fields>>>;
  /** Schema for JSON update input - excludes Generated, GeneratedByApp, and Sensitive fields */
  readonly jsonUpdate: S.Struct<S.Simplify<ExtractVariantFields<"jsonUpdate", Fields>>>;
}

/**
 * Base ModelClass interface.
 * Uses DSL.Fields constraint and computes schema types from the select variant.
 * TName and Id are string types that preserve literal table names.
 * @since 1.0.0
 * @category models
 */
export interface ModelClass<
  Self,
  Fields extends DSL.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  Relations extends RelationsConfig = RelationsConfig,
> extends S.Schema<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>,
    ModelStatics<TName, Columns, PK, Id, Fields, Relations> {
  new (
    props: S.Struct.Constructor<SelectVariantFields<Fields>>,
    options?: { readonly disableValidation?: boolean }
  ): S.Struct.Type<SelectVariantFields<Fields>>;

  readonly ast: import("effect/SchemaAST").Transformation;
  readonly fields: SelectVariantFields<Fields>;

  make<Args extends ReadonlyArray<unknown>, X>(this: { new (...args: Args): X }, ...args: Args): X;

  annotations(
    annotations: S.Annotations.Schema<Self>
  ): S.SchemaClass<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>;
}

/**
 * Static properties attached to a Model class.
 * TName and Id are string types that preserve literal table names.
 * @since 1.0.0
 * @category models
 */
export interface ModelStatics<
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string,
  Fields extends DSL.Fields = DSL.Fields,
  Relations extends RelationsConfig = RelationsConfig,
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  /** Original DSL fields - used for extracting encoded types in toDrizzle */
  readonly _fields: Fields;
  /** Model-level relations configuration */
  readonly relations: Relations;
}

/**
 * Interface for a Model class with any type parameters.
 * Used for runtime operations that only need static properties.
 *
 * This interface avoids the computed `fields` type issues that occur when
 * using `ModelClass<unknown, any, ...>` - the computed `SelectVariantFields<any>`
 * doesn't unify properly with concrete field types.
 *
 * Instead, we define just the properties needed at runtime:
 * - Static properties from ModelStatics
 * - Schema properties we might need for identity checks
 *
 * @since 1.0.0
 * @category models
 */
export interface AnyModelClass extends ModelStatics {
  /** Schema fields - use any to avoid computed type issues */
  readonly fields: Record<string, S.Schema.All>;
  /** Identifier for the schema */
  readonly identifier: string;
}

// ============================================================================
// Model Collection Utility Types
// ============================================================================

/**
 * Transforms either a record or an array of models into a record
 * where keys are model identifiers and values are the model classes.
 *
 * Similar to `ContractsByName` from `@beep/contract`.
 *
 * Note: Due to TypeScript's limitations with class constructor types,
 * the value types may be a union of all models. The keys are correctly
 * typed as the literal identifiers.
 *
 * @example
 * ```ts
 * type Models = ModelsByIdentifier<[typeof User, typeof Post]>;
 * // { readonly User: typeof User | typeof Post; readonly Post: typeof User | typeof Post }
 * ```
 *
 * @since 1.0.0
 * @category type-level
 */
export type ModelsByIdentifier<Models> =
  Models extends Record<string, AnyModelClass>
    ? { readonly [Id in keyof Models]: Models[Id] }
    : Models extends ReadonlyArray<AnyModelClass>
      ? { readonly [M in Models[number] as M["identifier"]]: Models[number] }
      : never;

/**
 * Transforms either a record or an array of models into a record
 * where keys are table names (snake_case) and values are the model classes.
 *
 * Note: Due to TypeScript's limitations with class constructor types,
 * the value types may be a union of all models. The keys are correctly
 * typed as the literal table names.
 *
 * @example
 * ```ts
 * type Models = ModelsByTableName<[typeof User, typeof Post]>;
 * // { readonly user: typeof User | typeof Post; readonly post: typeof User | typeof Post }
 * ```
 *
 * @since 1.0.0
 * @category type-level
 */
export type ModelsByTableName<Models> =
  Models extends Record<string, AnyModelClass>
    ? { readonly [TName in keyof Models]: Models[TName] }
    : Models extends ReadonlyArray<AnyModelClass>
      ? { readonly [M in Models[number] as M["tableName"]]: Models[number] }
      : never;

// ============================================================================
// Encoded Type Extraction for Drizzle .$type<T>()
// ============================================================================

/**
 * Extracts the encoded type from a DSL field for use with Drizzle's .$type<T>().
 *
 * For DSLVariantField: Uses the "select" variant's encoded type (as that represents the database row type)
 * For DSLField: Uses the schema's encoded type I
 * For plain Schema: Uses the schema's encoded type
 * For VariantSchema.Field: Uses the "select" variant's encoded type
 *
 * @since 1.0.0
 * @category type-level
 */
export type ExtractEncodedType<F> =
  // DSLVariantField (has column metadata + variant schemas)
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? ExtractVariantSelectEncoded<Config>
    : // Raw VariantSchema.Field (from @effect/sql/Model or local)
      [F] extends [VariantSchema.Field<infer Config>]
      ? ExtractVariantSelectEncoded<Config>
      : // DSLField (plain schema with column metadata) - extract inner schema's encoded type
        [F] extends [DSLField<infer _A, infer I, infer _R, ColumnDef>]
        ? I
        : // Plain Schema or PropertySignature - use the helper
          InferEncodedType<F>;

/**
 * Maps DSL fields to their encoded types for Drizzle column typing.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractEncodedTypes<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]: ExtractEncodedType<Fields[K]>;
};

// ============================================================================
// Relation Types (Phase 1 - Boilerplate)
// ============================================================================

/**
 * Relation cardinality discriminant.
 * @since 1.0.0
 * @category relations
 */
export type RelationType = "one" | "many" | "manyToMany";

/**
 * Foreign key action literals for ON DELETE/ON UPDATE.
 * @since 1.0.0
 * @category relations
 */
export type ForeignKeyAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

/**
 * Foreign key configuration.
 * @since 1.0.0
 * @category relations
 */
export interface ForeignKeyConfig {
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
  readonly name?: string;
}

/**
 * Field-level reference for foreign key columns.
 * Uses lazy thunk for target to handle circular dependencies.
 * @since 1.0.0
 * @category relations
 */
export interface FieldReference<Target extends AnyModelClass = AnyModelClass, TargetField extends string = string> {
  readonly target: () => Target;
  readonly field: TargetField;
  readonly foreignKey?: ForeignKeyConfig;
}

/**
 * Junction table configuration for many-to-many relations.
 * @since 1.0.0
 * @category relations
 */
export interface JunctionConfig<
  Junction extends AnyModelClass = AnyModelClass,
  FromField extends string = string,
  ToField extends string = string,
> {
  readonly through: () => Junction;
  readonly fromField: FromField;
  readonly toField: ToField;
}

/**
 * Base relation metadata interface.
 * @since 1.0.0
 * @category relations
 */
export interface RelationMeta<
  Type extends RelationType = RelationType,
  Target extends AnyModelClass = AnyModelClass,
  FromField extends string = string,
  ToField extends string = string,
> {
  readonly _tag: Type;
  readonly target: () => Target;
  readonly fromField: FromField;
  readonly toField: ToField;
  readonly optional: boolean;
  readonly foreignKey?: ForeignKeyConfig;
}

/**
 * One-to-one or many-to-one relation (from FK side).
 * @since 1.0.0
 * @category relations
 */
export interface OneRelation<
  Target extends AnyModelClass = AnyModelClass,
  FromField extends string = string,
  ToField extends string = string,
> extends RelationMeta<"one", Target, FromField, ToField> {}

/**
 * One-to-many relation (from PK side).
 * @since 1.0.0
 * @category relations
 */
export interface ManyRelation<
  Target extends AnyModelClass = AnyModelClass,
  FromField extends string = string,
  ToField extends string = string,
> extends RelationMeta<"many", Target, FromField, ToField> {}

/**
 * Many-to-many relation through junction table.
 * @since 1.0.0
 * @category relations
 */
export interface ManyToManyRelation<
  Target extends AnyModelClass = AnyModelClass,
  FromField extends string = string,
  ToField extends string = string,
  Junction extends AnyModelClass = AnyModelClass,
> extends RelationMeta<"manyToMany", Target, FromField, ToField> {
  readonly junction: JunctionConfig<Junction>;
}

/**
 * Union type for any relation.
 * @since 1.0.0
 * @category relations
 */
export type AnyRelation = OneRelation | ManyRelation | ManyToManyRelation;

/**
 * Relations configuration map.
 * @since 1.0.0
 * @category relations
 */
export type RelationsConfig = {
  readonly [name: string]: AnyRelation;
};

// Symbols for relation metadata attachment
export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);
export type RelationMetaSymbol = typeof RelationMetaSymbol;

export const ForeignKeySymbol: unique symbol = Symbol.for($I`foreign-key`);
export type ForeignKeySymbol = typeof ForeignKeySymbol;

// ============================================================================
// Type-Level Validation (Phase 1 - Boilerplate)
// ============================================================================

/**
 * Error type for field not found with helpful message.
 * @since 1.0.0
 * @category errors
 */
export interface FieldNotFoundError<M, F extends string> {
  readonly _tag: "FieldNotFoundError";
  readonly _brand: unique symbol;
  readonly _message: `Field '${F}' does not exist on model`;
  readonly _model: M;
}

/**
 * Error type for FK/PK type mismatch.
 * @since 1.0.0
 * @category errors
 */
export interface TypeMismatchError<From, FromField extends string, To, ToField extends string> {
  readonly _tag: "TypeMismatchError";
  readonly _brand: unique symbol;
  readonly _message: `Type of '${FromField}' does not match type of '${ToField}'`;
  readonly _from: From;
  readonly _to: To;
}

/**
 * Validates that a field exists on a model.
 * Returns the field name if valid, otherwise returns FieldNotFoundError.
 * @since 1.0.0
 * @category type-level
 */
export type ValidateFieldExists<M extends { _fields: DSL.Fields }, F extends string> = F extends keyof M["_fields"]
  ? F
  : FieldNotFoundError<M, F>;

/**
 * Validates FK/PK type compatibility between models.
 * @since 1.0.0
 * @category type-level
 */
export type ValidateForeignKeyTypes<
  From extends { _fields: DSL.Fields },
  FromField extends string,
  To extends { _fields: DSL.Fields },
  ToField extends string,
> = ExtractEncodedType<From["_fields"][FromField & keyof From["_fields"]]> extends ExtractEncodedType<
  To["_fields"][ToField & keyof To["_fields"]]
>
  ? true
  : TypeMismatchError<From, FromField, To, ToField>;

// ============================================================================
// defineRelations Pattern Types (Phase 1 - Model Relations Redesign)
// ============================================================================

/**
 * Field references for a model - maps field names to typed string literals.
 *
 * Used in the `defineRelations` callback to provide compile-time field validation.
 * Each property key is a field name from the model, and its value is the same
 * field name as a string literal type.
 *
 * @example
 * ```ts
 * // Given a model with fields { id, name, email }
 * type Refs = ModelFieldRefs<typeof User>;
 * // { readonly id: "id"; readonly name: "name"; readonly email: "email" }
 *
 * // Usage in defineRelations callback:
 * defineRelations(Post, (fields) => ({
 *   // fields.authorId provides autocomplete and type checking
 *   author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
 * }));
 * ```
 *
 * @since 1.0.0
 * @category relations
 */
export type ModelFieldRefs<M extends AnyModelClass> = {
  readonly [K in keyof M["_fields"] & string]: K;
};

/**
 * Result of `defineRelations()` - bundles a model with its relations configuration.
 *
 * This type represents the output of the `defineRelations` function, which pairs
 * a fully-defined model class with its relations. The callback pattern in
 * `defineRelations` breaks circular type dependencies by deferring relation
 * type evaluation until after all models are defined.
 *
 * @example
 * ```ts
 * // Created by defineRelations:
 * const postRelations: ModelRelationsDefinition<typeof Post, {
 *   author: OneRelation<typeof User, "authorId", "id">;
 *   comments: ManyRelation<typeof Comment, "id", "postId">;
 * }> = defineRelations(Post, (fields) => ({
 *   author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
 *   comments: Relation.many(() => Comment, { from: fields.id, to: "postId" }),
 * }));
 * ```
 *
 * @since 1.0.0
 * @category relations
 */
export interface ModelRelationsDefinition<
  M extends AnyModelClass = AnyModelClass,
  R extends RelationsConfig = RelationsConfig,
> {
  readonly _tag: "ModelRelationsDefinition";
  readonly model: M;
  readonly relations: R;
}

/**
 * Union type for inputs to relation aggregation functions.
 *
 * Accepts either:
 * - Raw model classes (with static `relations` property) - legacy pattern
 * - `ModelRelationsDefinition` objects - new `defineRelations()` pattern
 *
 * This provides backwards compatibility: existing code using `ModelConfig.relations`
 * continues to work, while new code can use the `defineRelations()` pattern for
 * models with circular dependencies.
 *
 * @example
 * ```ts
 * // Both patterns work with toDrizzleRelations:
 * const relations = toDrizzleRelations([
 *   User,                    // Raw model with static relations
 *   postRelations,           // ModelRelationsDefinition from defineRelations
 *   commentRelations,        // ModelRelationsDefinition from defineRelations
 * ], tables);
 * ```
 *
 * @since 1.0.0
 * @category relations
 */
export type RelationsInput = AnyModelClass | ModelRelationsDefinition;
