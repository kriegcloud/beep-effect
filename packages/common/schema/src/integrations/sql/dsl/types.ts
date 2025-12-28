import { $SchemaId } from "@beep/identity/packages";
import type * as S from "effect/Schema";
import type * as VariantSchema from "../../../core/VariantSchema";
import type { ColumnType, ModelVariant } from "./literals.ts";

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
export type ColumnTypeToTS<T extends ColumnType.Type> = T extends "string" | "uuid"
  ? string
  : T extends "number" | "integer"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "datetime"
        ? string | Date
        : T extends "json"
          ? object | unknown[] | Record<string, unknown>
          : T extends "bigint"
            ? bigint
            : never;

/**
 * Maps TypeScript types to their compatible ColumnTypes.
 * Used to provide helpful error messages showing allowed column types.
 * @since 1.0.0
 * @category type-level
 */
export type TSToColumnTypes<T> =
  // Check for Date first (before object check, since Date extends object)
  [T] extends [Date]
    ? "datetime"
    : // Check for array types (before object check)
      [T] extends [readonly unknown[]]
      ? "json"
      : // Check for object/record types
        [T] extends [object]
        ? "json"
        : // Primitive checks
          [T] extends [string]
          ? "string" | "uuid" | "datetime"
          : [T] extends [number]
            ? "number" | "integer"
            : [T] extends [boolean]
              ? "boolean"
              : [T] extends [bigint]
                ? "bigint"
                : never;

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
 * This check is lenient with nullable types: if the base type (excluding null/undefined)
 * is compatible with the column type, the check passes. This allows nullable columns
 * (e.g., `S.NullOr(S.String)` encoding to `string | null`) to work with their base column type.
 *
 * @since 1.0.0
 * @category type-level
 */
export type IsSchemaColumnCompatible<SchemaEncoded, ColType extends ColumnType.Type> = ColType extends "string" | "uuid" // Handle union types by checking if the column type works for the non-nullable base type
  ? [StripNullable<SchemaEncoded>] extends [string]
    ? true
    : [StripNullable<SchemaEncoded>] extends [never] // Handle case where SchemaEncoded is just null
      ? false
      : false
  : ColType extends "datetime"
    ? [StripNullable<SchemaEncoded>] extends [string | Date]
      ? true
      : false
    : ColType extends "number" | "integer"
      ? [StripNullable<SchemaEncoded>] extends [number]
        ? true
        : false
      : ColType extends "boolean"
        ? [StripNullable<SchemaEncoded>] extends [boolean]
          ? true
          : false
        : ColType extends "json"
          ? [StripNullable<SchemaEncoded>] extends [object | readonly unknown[]]
            ? true
            : false
          : false;

/**
 * Pretty-prints a TypeScript type for error messages.
 * @since 1.0.0
 * @category type-level
 */
export type PrettyPrintType<T> = [T] extends [string]
  ? "string"
  : [T] extends [number]
    ? "number"
    : [T] extends [boolean]
      ? "boolean"
      : [T] extends [Date]
        ? "Date"
        : [T] extends [readonly unknown[]]
          ? "Array"
          : [T] extends [object]
            ? "object"
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

/**
 * Extracts the encoded type from a VariantSchema.Field's "select" variant.
 * Used for column compatibility validation of variant fields.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractVariantSelectEncoded<VC> = VC extends { select: infer SelectSchema }
  ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
    ? I
    : [SelectSchema] extends [
          S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>,
        ]
      ? I
      : unknown
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
export type ExtractVariantSelectSchema<VC> = VC extends { select: infer SelectSchema }
  ? [SelectSchema] extends [S.Schema<infer _A, infer _I, infer _R>]
    ? SelectSchema
    : [SelectSchema] extends [
          S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer _I, infer _HD, infer _C>,
        ]
      ? SelectSchema
      : unknown
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
        : // Date must be checked before object (Date extends object)
          [StripNullable<I>] extends [Date]
          ? "datetime"
          : // Arrays map to json (check before object since arrays are objects)
            [StripNullable<I>] extends [readonly unknown[]]
            ? "json"
            : // Object types (structs, records) map to json
              [StripNullable<I>] extends [object]
              ? "json"
              : // Primitive type mappings
                [StripNullable<I>] extends [string]
                ? "string"
                : [StripNullable<I>] extends [number]
                  ? "number"
                  : [StripNullable<I>] extends [boolean]
                    ? "boolean"
                    : [StripNullable<I>] extends [bigint]
                      ? "bigint"
                      : // Fallback for unknown types
                        ColumnType.Type;

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
 * Derives column type from specific schema types after ruling out any/unknown/object.
 *
 * IMPORTANT: The ordering of checks is critical:
 * 1. FIRST: Check specific transformation/refinement types (S.Int, S.UUID, S.BigInt, etc.)
 *    - These MUST be checked before generic filter/transform checks
 * 2. SECOND: Check for generic refinements/filters - recurse to inner type
 * 3. THIRD: Check for generic transformations - recurse to encoded side
 * 4. LAST: Fallback to encoded type derivation
 *
 * @internal
 */
type DeriveColumnTypeFromSchemaSpecific<Schema, A> =
  // FIRST: Check specific schema types (before generic filter/transform checks)
  // Integer type (refined from number)
  Schema extends typeof S.Int
    ? "integer"
    : // Number refinements (still number, not integer)
      Schema extends typeof S.Positive
      ? "number"
      : Schema extends typeof S.Negative
        ? "number"
        : Schema extends typeof S.NonPositive
          ? "number"
          : Schema extends typeof S.NonNegative
            ? "number"
            : // UUID/ULID types (refined from string)
              Schema extends typeof S.UUID
              ? "uuid"
              : Schema extends typeof S.ULID
                ? "uuid"
                : // DateTime types (transformations - check before generic transform)
                  Schema extends typeof S.DateFromString
                  ? "datetime"
                  : Schema extends typeof S.Date
                    ? "datetime"
                    : Schema extends typeof S.DateTimeUtc
                      ? "datetime"
                      : Schema extends typeof S.DateTimeUtcFromSelf
                        ? "datetime"
                        : // BigInt types (transformations - check before generic transform)
                          Schema extends typeof S.BigInt
                          ? "bigint"
                          : Schema extends typeof S.BigIntFromSelf
                            ? "bigint"
                            : // SECOND: Generic refinements/filters - recurse to inner type
                              Schema extends S.filter<infer Inner>
                              ? DeriveColumnTypeFromSchemaInner<Inner>
                              : Schema extends S.refine<infer _A2, infer From>
                                ? DeriveColumnTypeFromSchemaInner<From>
                                : // THIRD: Generic transformations - recurse to encoded side
                                  Schema extends S.transform<infer From, infer _To>
                                  ? DeriveColumnTypeFromSchemaInner<From>
                                  : Schema extends S.transformOrFail<infer From, infer _To, infer _R2>
                                    ? DeriveColumnTypeFromSchemaInner<From>
                                    : // LAST: Fallback to Type parameter derivation
                                      DeriveFromTypeParameter<A>;

/**
 * Derives column type from the schema's Type parameter (A).
 * Used as a fallback when schema-specific checks don't match.
 *
 * IMPORTANT: Primitive checks must come BEFORE object checks.
 * Branded types like `string & Brand<"X">` are intersections with an object type,
 * so they match `[object]`. By checking primitives first, we correctly derive
 * branded strings as "string", branded numbers as "number", etc.
 *
 * @internal
 */
type DeriveFromTypeParameter<A> =
  // Check for Date (before object since Date extends object)
  [A] extends [Date]
    ? "datetime"
    : // Check for array types (before object since arrays are objects)
      [A] extends [readonly unknown[]]
      ? "json"
      : // Check primitives BEFORE object (branded types are primitive & object intersections)
        [A] extends [string]
        ? "string"
        : [A] extends [number]
          ? "number"
          : [A] extends [boolean]
            ? "boolean"
            : [A] extends [bigint]
              ? "bigint"
              : // Check for object types (records, structs) - AFTER primitives
                [A] extends [object]
                ? "json"
                : // Fallback
                  ColumnType.Type;

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
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};

// Generic ColumnDef preserves specific literals
// Note: `nullable` has been removed - nullability is derived from the Effect Schema AST
export interface ColumnDef<
  T extends ColumnType.Type = ColumnType.Type,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  AI extends boolean = boolean,
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}

// Helper to create exact ColumnDef from partial config
// Note: `nullable` has been removed - nullability is derived from the Effect Schema AST
// When no explicit type is given, use ColumnType.Type union (runtime derives the actual type)
export type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T extends ColumnType.Type } ? T : ColumnType.Type;
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};

export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
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
> extends ModelClass<Self, Fields, TName, Columns, PK, Id> {
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
> extends S.Schema<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>,
    ModelStatics<TName, Columns, PK, Id, Fields> {
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
 * @since 1.0.0
 * @category models
 */
export interface ModelStatics<
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string,
  Fields extends DSL.Fields = DSL.Fields,
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  /** Original DSL fields - used for extracting encoded types in toDrizzle */
  readonly _fields: Fields;
}

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
    ? Config extends { select: infer SelectSchema }
      ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
        ? I
        : [SelectSchema] extends [
              S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>,
            ]
          ? I
          : unknown
      : unknown
    : // Raw VariantSchema.Field (from @effect/sql/Model or local)
      [F] extends [VariantSchema.Field<infer Config>]
      ? Config extends { select: infer SelectSchema }
        ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
          ? I
          : [SelectSchema] extends [
                S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>,
              ]
            ? I
            : unknown
        : unknown
      : // DSLField (plain schema with column metadata)
        [F] extends [DSLField<infer _A, infer I, infer _R, ColumnDef>]
        ? I
        : // Plain Schema
          [F] extends [S.Schema<infer _A, infer I, infer _R>]
          ? I
          : // PropertySignature
            [F] extends [S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>]
            ? I
            : unknown;

/**
 * Maps DSL fields to their encoded types for Drizzle column typing.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractEncodedTypes<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]: ExtractEncodedType<Fields[K]>;
};
