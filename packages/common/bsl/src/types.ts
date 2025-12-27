import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $BslId.create("types");

export class ModelVariant extends BS.StringLiteralKit(
  "select",
  "insert",
  "update",
  "json",
  "jsonCreate",
  "jsonUpdate"
).annotations(
  $I.annotations("ModelVariant", {
    description: "One of the possible variants of a domain model schema.",
  })
) {}

export declare namespace ModelVariant {
  export type Type = typeof ModelVariant.Type;
}

export class ColumnType extends BS.StringLiteralKit(
  "string",
  "number",
  "integer",
  "boolean",
  "datetime",
  "uuid",
  "json"
).annotations(
  $I.annotations("ColumnType", {
    description: "One of the possible column types in a domain model schema.",
  })
) {}

export declare namespace ColumnType {
  export type Type = typeof ColumnType.Type;
}

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

// Generic ColumnDef preserves specific literals
export interface ColumnDef<
  T extends ColumnType.Type = ColumnType.Type,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  N extends boolean = boolean,
  AI extends boolean = boolean,
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly nullable?: N;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}

// Helper to create exact ColumnDef from partial config
export type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T extends ColumnType.Type } ? T : "string";
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  readonly nullable: C extends { nullable: infer N extends boolean } ? N : false;
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};

export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
}

// Annotation symbol - use Symbol.for for cross-module consistency
export const ColumnMetaSymbol: unique symbol = Symbol.for($I`column-meta`);
export type ColumnMetaSymbol = typeof ColumnMetaSymbol;

// Symbol for detecting BSL variant fields
export const VariantFieldSymbol: unique symbol = Symbol.for($I`variant-field`);
export type VariantFieldSymbol = typeof VariantFieldSymbol;

/**
 * BSLField wraps a plain Schema with column metadata.
 * @since 1.0.0
 */
export interface BSLField<A, I = A, R = never, C extends ColumnDef = ColumnDef> extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
}

/**
 * BSLVariantField wraps a VariantSchema.Field with column metadata.
 * Carries BOTH column metadata AND variant config for multi-variant models.
 * @since 1.0.0
 */
export interface BSLVariantField<A extends BS.VariantSchema.Field.Config, C extends ColumnDef = ColumnDef>
  extends BS.VariantSchema.Field<A> {
  readonly [ColumnMetaSymbol]: C;
  readonly [VariantFieldSymbol]: true;
}

/**
 * BSL namespace containing field type definitions.
 * Uses a wider type constraint than S.Struct.Fields to include BSLVariantField and VariantSchema.Field.
 * This mirrors VariantSchema.Struct.Fields pattern.
 * @since 1.0.0
 * @category models
 */
export declare namespace BSL {
  /**
   * Fields type that includes all valid field types for BSL models.
   * Unlike S.Struct.Fields, this includes BSLVariantField and raw VariantSchema.Field types.
   * Uses `any` for variant config types to preserve specific field configurations during inference.
   * @since 1.0.0
   */
  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | BSLField<any, any, any, ColumnDef>
      | BSLVariantField<any, ColumnDef>
      | BS.VariantSchema.Field<any>
      | undefined;
  };
}

/**
 * Type guard to check if a value is a BSLVariantField.
 * @since 1.0.0
 */
export const isBSLVariantField = <A extends BS.VariantSchema.Field.Config, C extends ColumnDef>(
  u: unknown
): u is BSLVariantField<A, C> =>
  u !== null &&
  typeof u === "object" &&
  VariantFieldSymbol in u &&
  (u as Record<symbol, unknown>)[VariantFieldSymbol] === true;

/**
 * Conditional return type for Field factory.
 * Determines the appropriate return type based on input type.
 * @since 1.0.0
 */
export type FieldResult<Input, C extends ColumnDef> = Input extends BS.VariantSchema.Field<infer VariantConfig>
  ? BSLVariantField<VariantConfig, C>
  : Input extends S.Schema<infer A, infer I, infer R>
    ? BSLField<A, I, R, C>
    : Input extends S.PropertySignature<
          infer _TypeToken,
          infer Type,
          infer _Key,
          infer _EncodedToken,
          infer Encoded,
          infer _HasDefault,
          infer Context
        >
      ? BSLField<Type, Encoded, Context, C>
      : never;

// ============================================================================
// Variant Extraction Types
// ============================================================================

/**
 * Extracts fields for a specific variant from BSL fields.
 * - BSLVariantField / VariantSchema.Field: Include field only if variant is in its config
 * - BSLField / Plain Schema: Include in all variants
 * Uses BSL.Fields constraint which is wider than S.Struct.Fields.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractVariantFields<V extends ModelVariant.Type, Fields extends BSL.Fields> = {
  readonly [K in keyof Fields as ShouldIncludeField<V, Fields[K]> extends true ? K : never]: ExtractFieldSchema<
    V,
    Fields[K]
  >;
};

/**
 * Determines if a field should be included in a specific variant.
 * Uses tuple wrapping to prevent distributive conditional types.
 * Checks for BSLVariantField (has column metadata) and raw VariantSchema.Field.
 * Uses unconstrained infer to preserve specific config types.
 * @since 1.0.0
 * @category type-level
 */
export type ShouldIncludeField<V extends string, F> = [F] extends [BSLVariantField<infer Config, any>] // Check BSLVariantField wrapper (has column metadata) - use any for ColumnDef to avoid matching issues
  ? V extends keyof Config
    ? true
    : false
  : // Check raw VariantSchema.Field (from @effect/experimental or @effect/sql/Model)
    [F] extends [BS.VariantSchema.Field<infer Config>]
    ? V extends keyof Config
      ? true
      : false
    : // Plain BSLField/Schema included in all variants
      true;

/**
 * Extracts the schema type for a field in a specific variant.
 * Uses tuple wrapping to prevent distributive conditional types.
 * Guards V extends keyof Config before accessing Config[V] for safety.
 * Handles BSLVariantField, raw VariantSchema.Field, BSLField, and plain Schema.
 * Uses unconstrained infer (any) for ColumnDef to preserve specific config types.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractFieldSchema<V extends string, F> = [F] extends [BSLVariantField<infer Config, any>] // BSLVariantField (has column metadata) - use any for ColumnDef to avoid matching issues
  ? V extends keyof Config // Guard FIRST
    ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All] // THEN safe access
      ? Config[V]
      : never
    : never
  : // Raw VariantSchema.Field (from @effect/experimental or @effect/sql/Model)
    [F] extends [BS.VariantSchema.Field<infer Config>]
    ? V extends keyof Config
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]
        ? Config[V]
        : never
      : never
    : // BSLField (plain schema with column metadata) - use any for ColumnDef
      [F] extends [BSLField<infer A, infer I, infer R, any>]
      ? S.Schema<A, I, R>
      : // Plain Schema
        [F] extends [S.Schema.All]
        ? F
        : // PropertySignature
          [F] extends [S.PropertySignature.All]
          ? F
          : never;

/**
 * Helper type to compute the select variant's schema fields from BSL.Fields.
 * Used for the base class schema operations.
 * @since 1.0.0
 * @category type-level
 */
export type SelectVariantFields<Fields extends BSL.Fields> = S.Simplify<ExtractVariantFields<"select", Fields>>;

/**
 * Model class interface that includes 6 variant schema accessors.
 * Uses intersection pattern: BaseClass & VariantAccessors.
 * @since 1.0.0
 * @category models
 */
export interface ModelClassWithVariants<
  Self,
  Fields extends BSL.Fields,
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
 * Uses BSL.Fields constraint and computes schema types from the select variant.
 * @since 1.0.0
 * @category models
 */
export interface ModelClass<
  Self,
  Fields extends BSL.Fields,
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
  Fields extends BSL.Fields = BSL.Fields,
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  /** Original BSL fields - used for extracting encoded types in toDrizzle */
  readonly _fields: Fields;
}

// ============================================================================
// Encoded Type Extraction for Drizzle .$type<T>()
// ============================================================================

/**
 * Extracts the encoded type from a BSL field for use with Drizzle's .$type<T>().
 *
 * For BSLVariantField: Uses the "select" variant's encoded type (as that represents the database row type)
 * For BSLField: Uses the schema's encoded type I
 * For plain Schema: Uses the schema's encoded type
 * For VariantSchema.Field: Uses the "select" variant's encoded type
 *
 * @since 1.0.0
 * @category type-level
 */
export type ExtractEncodedType<F> =
  // BSLVariantField (has column metadata + variant schemas)
  [F] extends [BSLVariantField<infer Config, ColumnDef>]
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
      [F] extends [BS.VariantSchema.Field<infer Config>]
      ? Config extends { select: infer SelectSchema }
        ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
          ? I
          : [SelectSchema] extends [
                S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>,
              ]
            ? I
            : unknown
        : unknown
      : // BSLField (plain schema with column metadata)
        [F] extends [BSLField<infer _A, infer I, infer _R, ColumnDef>]
        ? I
        : // Plain Schema
          [F] extends [S.Schema<infer _A, infer I, infer _R>]
          ? I
          : // PropertySignature
            [F] extends [S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>]
            ? I
            : unknown;

/**
 * Maps BSL fields to their encoded types for Drizzle column typing.
 * @since 1.0.0
 * @category type-level
 */
export type ExtractEncodedTypes<Fields extends BSL.Fields> = {
  readonly [K in keyof Fields]: ExtractEncodedType<Fields[K]>;
};
