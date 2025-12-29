/**
 * @fileoverview Pipe-friendly combinators for building SQL column definitions.
 *
 * This module provides composable combinators that transform Effect Schemas into
 * DSLFields with column metadata. Combinators follow Effect's pipe-first style
 * and can be chained to build up configuration incrementally.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Simple column
 * const idField = S.String.pipe(DSL.uuid, DSL.primaryKey);
 *
 * // Auto-increment integer
 * const countField = S.Int.pipe(DSL.integer, DSL.autoIncrement);
 *
 * // Nullable with default
 * const timestampField = S.String.pipe(
 *   DSL.datetime,
 *   DSL.nullable,
 *   DSL.defaultValue("now()")
 * );
 * ```
 *
 * @since 1.0.0
 * @category combinators
 */
import type * as S from "effect/Schema";
import { deriveColumnType } from "./derive-column-type.ts";
import { extractASTFromInput } from "./Field.ts";
import { ColumnType } from "./literals.ts";
import type { ColumnDef, DeriveColumnTypeFromSchema, DSLField, ExactColumnDef, ValidateSchemaColumn } from "./types";
import { ColumnMetaSymbol } from "./types";

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Default column definition with type derived from the schema.
 * Used when no existing column metadata is present.
 *
 * Uses `DeriveColumnTypeFromSchema` to correctly infer column types:
 * - `S.Int` → `"integer"` (not `"number"`)
 * - `S.UUID` → `"uuid"` (not `"string"`)
 * - `S.Date` → `"datetime"`
 * - etc.
 *
 * @internal
 */
type DerivedDefaultColumnDef<Schema> = {
  readonly type: DeriveColumnTypeFromSchema<Schema>;
  readonly primaryKey: false;
  readonly unique: false;
  readonly autoIncrement: false;
  readonly defaultValue: undefined;
};

/**
 * Resolves column definition: uses DerivedDefaultColumnDef when C is never (no existing metadata),
 * otherwise preserves the specific column definition type.
 *
 * @param Schema - The Effect Schema type used to derive default column type
 * @param C - The existing column definition type, or never if none
 * @internal
 */
type ResolveColumnDef<Schema, C> = [C] extends [never] ? DerivedDefaultColumnDef<Schema> : C;

/**
 * Extracts existing column metadata from a schema, or returns defaults.
 * Note: nullable is no longer stored in ColumnDef - it's derived from the schema AST
 * @internal
 */
// type GetColumnDef<Schema> = Schema extends { [ColumnMetaSymbol]: infer C extends ColumnDef }
//   ? C
//   : DefaultColumnDef;

/**
 * Merges existing column definition with new properties.
 * New properties override existing ones.
 * Note: nullable is no longer part of ColumnDef - it's derived from the schema AST
 * @internal
 */
type MergeColumnDef<Existing extends Partial<ColumnDef>, New extends Partial<ColumnDef>> = ExactColumnDef<{
  readonly type: New extends { type: infer T } ? T : Existing extends { type: infer T } ? T : "string";
  readonly primaryKey: New extends { primaryKey: infer PK }
    ? PK
    : Existing extends { primaryKey: infer PK }
      ? PK
      : false;
  readonly unique: New extends { unique: infer U } ? U : Existing extends { unique: infer U } ? U : false;
  readonly autoIncrement: New extends { autoIncrement: infer AI }
    ? AI
    : Existing extends { autoIncrement: infer AI }
      ? AI
      : false;
  readonly defaultValue: New extends { defaultValue: infer DV }
    ? DV
    : Existing extends { defaultValue: infer DV }
      ? DV
      : undefined;
}>;

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Creates a DSLField by merging existing column metadata with new properties.
 * Note: nullable is no longer stored here - it's derived from the schema AST
 * @internal
 */
const attachColumnDef = <A, I, R>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, ColumnDef>,
  partial: Partial<ColumnDef>
): DSLField<A, I, R, any> => {
  // Extract existing metadata if present
  const existingDef = (self as any)[ColumnMetaSymbol] as ColumnDef | undefined;

  // Merge with defaults (nullable removed - it's derived from schema AST)
  const columnDef: ColumnDef = {
    type: partial.type ?? existingDef?.type ?? deriveColumnType(extractASTFromInput(self)),
    primaryKey: partial.primaryKey ?? existingDef?.primaryKey ?? false,
    unique: partial.unique ?? existingDef?.unique ?? false,
    autoIncrement: partial.autoIncrement ?? existingDef?.autoIncrement ?? false,
    defaultValue: partial.defaultValue ?? existingDef?.defaultValue,
  };

  // Attach via annotations API
  const annotated = self.annotations({
    [ColumnMetaSymbol]: columnDef,
  });

  // Also attach as direct property for easy runtime access
  return Object.assign(annotated, {
    [ColumnMetaSymbol]: columnDef,
  });
};

// ============================================================================
// Type Setters
// ============================================================================

/**
 * Sets the column type to "uuid" (PostgreSQL UUID type).
 *
 * Validates that the schema's encoded type is compatible with UUID columns (must be string).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // ✅ Valid - string encodes to string
 * const field = S.String.pipe(DSL.uuid);
 *
 * // ❌ Compile error - number incompatible with uuid
 * const invalid = S.Int.pipe(DSL.uuid);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const uuid = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "uuid",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "uuid" }>>
> => attachColumnDef(self, ColumnType.parameterize.uuid) as any;

/**
 * Sets the column type to "string" (PostgreSQL TEXT type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const field = S.String.pipe(DSL.string);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const string = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "string",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "string" }>>
> => attachColumnDef(self, ColumnType.parameterize.string) as any;

/**
 * Sets the column type to "integer" (PostgreSQL INTEGER type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const field = S.Int.pipe(DSL.integer);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const integer = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "integer",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "integer" }>>
> => attachColumnDef(self, ColumnType.parameterize.integer) as any;

/**
 * Sets the column type to "number" (PostgreSQL DOUBLE PRECISION type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const field = S.Number.pipe(DSL.number);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const number = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "number",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "number" }>>
> => attachColumnDef(self, ColumnType.parameterize.number) as any;

/**
 * Sets the column type to "boolean" (PostgreSQL BOOLEAN type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const field = S.Boolean.pipe(DSL.boolean);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const boolean = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "boolean",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "boolean" }>>
> => attachColumnDef(self, ColumnType.parameterize.boolean) as any;

/**
 * Sets the column type to "json" (PostgreSQL JSONB type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const MetadataSchema = S.Struct({
 *   tags: S.Array(S.String),
 *   score: S.Number,
 * });
 *
 * const field = MetadataSchema.pipe(DSL.json);
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const json = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "json",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "json" }>>
> => attachColumnDef(self, ColumnType.parameterize.json) as any;

/**
 * Sets the column type to "datetime" (PostgreSQL TIMESTAMP type).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const field = S.String.pipe(DSL.datetime); // ISO date strings
 * ```
 *
 * @since 1.0.0
 * @category type setters
 */
export const datetime = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): ValidateSchemaColumn<
  I,
  "datetime",
  DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { type: "datetime" }>>
> => attachColumnDef(self, ColumnType.parameterize.datetime) as any;

// ============================================================================
// Constraint Setters
// ============================================================================

/**
 * Marks the column as a primary key.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const idField = S.String.pipe(DSL.uuid, DSL.primaryKey);
 * ```
 *
 * @since 1.0.0
 * @category constraint setters
 */
export const primaryKey = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { primaryKey: true }>> =>
  attachColumnDef(self, { primaryKey: true } as const);

/**
 * Marks the column as unique (adds UNIQUE constraint).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const emailField = S.String.pipe(DSL.string, DSL.unique);
 * ```
 *
 * @since 1.0.0
 * @category constraint setters
 */
export const unique = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { unique: true }>> =>
  attachColumnDef(self, { unique: true } as const);

/**
 * Marks the column as auto-incrementing (PostgreSQL SERIAL or GENERATED ALWAYS AS IDENTITY).
 *
 * Typically used with integer primary keys.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const idField = S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement);
 * ```
 *
 * @since 1.0.0
 * @category constraint setters
 */
export const autoIncrement = <A, I, R, C extends ColumnDef = never>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { autoIncrement: true }>> =>
  attachColumnDef(self, { autoIncrement: true } as const);

// ============================================================================
// Default Value Setter
// ============================================================================

/**
 * Sets a default value for the column.
 *
 * Accepts either a static string or a function that returns a string.
 * The string is used as-is in SQL (e.g., "now()", "'default'").
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Static default
 * const statusField = S.String.pipe(
 *   DSL.string,
 *   DSL.defaultValue("'active'")
 * );
 *
 * // Function default (SQL expression)
 * const createdAtField = S.String.pipe(
 *   DSL.datetime,
 *   DSL.defaultValue("now()")
 * );
 * ```
 *
 * @since 1.0.0
 * @category constraint setters
 */
export const defaultValue =
  <A, I, R, C extends ColumnDef = never>(value: string | (() => string)) =>
  (
    self: S.Schema<A, I, R> | DSLField<A, I, R, C>
  ): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { defaultValue: typeof value }>> =>
    attachColumnDef(self, { defaultValue: value } as const);
