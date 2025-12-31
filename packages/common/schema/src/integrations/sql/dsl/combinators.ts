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

import * as P from "effect/Predicate";
import type * as S from "effect/Schema";
import { deriveColumnType } from "./derive-column-type.ts";
import { extractASTFromInput } from "./Field.ts";
import { ColumnType } from "./literals.ts";
import type {
  ColumnDef,
  DeriveColumnTypeFromSchema,
  DSL,
  DSLField,
  ExactColumnDef,
  FieldReference,
  ForeignKeyConfig,
  ModelClass,
  ValidateSchemaColumn,
} from "./types";
import { ColumnMetaSymbol, ForeignKeySymbol } from "./types";

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
  readonly default?: undefined;
  readonly $default?: undefined;
  readonly $defaultFn?: undefined;
  readonly $onUpdate?: undefined;
  readonly $onUpdateFn?: undefined;
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
  readonly default?: New extends { default: infer D } ? D : Existing extends { default: infer D } ? D : undefined;
  readonly $default?: New extends { $default: infer DF }
    ? DF
    : Existing extends { $default: infer DF }
      ? DF
      : undefined;
  readonly $defaultFn?: New extends { $defaultFn: infer DFn }
    ? DFn
    : Existing extends { $defaultFn: infer DFn }
      ? DFn
      : undefined;
  readonly $onUpdate?: New extends { $onUpdate: infer OU }
    ? OU
    : Existing extends { $onUpdate: infer OU }
      ? OU
      : undefined;
  readonly $onUpdateFn?: New extends { $onUpdateFn: infer OUFn }
    ? OUFn
    : Existing extends { $onUpdateFn: infer OUFn }
      ? OUFn
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
    // New default properties
    default: partial.default ?? existingDef?.default,
    $default: partial.$default ?? existingDef?.$default,
    $defaultFn: partial.$defaultFn ?? existingDef?.$defaultFn,
    $onUpdate: partial.$onUpdate ?? existingDef?.$onUpdate,
    $onUpdateFn: partial.$onUpdateFn ?? existingDef?.$onUpdateFn,
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
// Default Value Setters
// ============================================================================

/**
 * Sets a static SQL default value for the column.
 * The value is evaluated by the database, not by Drizzle at runtime.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Static SQL default
 * const statusField = S.String.pipe(
 *   DSL.string,
 *   DSL.sqlDefault("'active'")
 * );
 *
 * // SQL function default
 * const createdAtField = S.String.pipe(
 *   DSL.datetime,
 *   DSL.sqlDefault("now()")
 * );
 * ```
 *
 * @since 1.0.0
 * @category default setters
 */
export const sqlDefault =
  <A, I, R, C extends ColumnDef = never>(value: string) =>
  (
    self: S.Schema<A, I, R> | DSLField<A, I, R, C>
  ): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { default: typeof value }>> =>
    attachColumnDef(self, { default: value } as const);

/**
 * Alias for `sqlDefault` - sets a static SQL default value.
 * @deprecated Use `sqlDefault` instead for clarity
 * @since 1.0.0
 * @category default setters
 */
export { sqlDefault as defaultValue };

/**
 * Sets a runtime default function for the column.
 * The function is called by Drizzle on INSERT when no value is provided.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Runtime default function
 * const idField = S.String.pipe(
 *   DSL.uuid,
 *   DSL.$defaultFn(() => crypto.randomUUID())
 * );
 * ```
 *
 * @since 1.0.0
 * @category default setters
 */
export const $defaultFn =
  <A, I, R, C extends ColumnDef = never>(fn: () => unknown) =>
  (
    self: S.Schema<A, I, R> | DSLField<A, I, R, C>
  ): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { $defaultFn: typeof fn }>> =>
    attachColumnDef(self, { $defaultFn: fn } as const);

/**
 * Alias for `$defaultFn` - sets a runtime default function.
 * @since 1.0.0
 * @category default setters
 */
export { $defaultFn as $default };

/**
 * Sets a runtime update function for the column.
 * The function is called by Drizzle on UPDATE when no value is provided.
 * Also used on INSERT if no `$defaultFn` is set.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Runtime update function
 * const updatedAtField = S.String.pipe(
 *   DSL.datetime,
 *   DSL.$onUpdateFn(() => new Date().toISOString())
 * );
 * ```
 *
 * @since 1.0.0
 * @category default setters
 */
export const $onUpdateFn =
  <A, I, R, C extends ColumnDef = never>(fn: () => unknown) =>
  (
    self: S.Schema<A, I, R> | DSLField<A, I, R, C>
  ): DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<S.Schema<A, I, R>, C>, { $onUpdateFn: typeof fn }>> =>
    attachColumnDef(self, { $onUpdateFn: fn } as const);

/**
 * Alias for `$onUpdateFn` - sets a runtime update function.
 * @since 1.0.0
 * @category default setters
 */
export { $onUpdateFn as $onUpdate };

// ============================================================================
// Reference Combinator
// ============================================================================

/**
 * Marks a field as referencing another model's field (foreign key).
 *
 * This is a pipe-friendly combinator for use with other DSL combinators
 * like DSL.uuid, DSL.string, etc. It attaches foreign key metadata
 * that is used by toDrizzle to generate FK constraints.
 *
 * @example
 * ```ts
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * // Using with pipe
 * const authorIdField = UserId.pipe(
 *   DSL.uuid,
 *   DSL.references(() => User, "id", { onDelete: "cascade" })
 * );
 *
 * // In Model definition
 * class Post extends Model<Post>("Post")({
 *   authorId: authorIdField,
 *   // or inline:
 *   categoryId: CategoryId.pipe(
 *     DSL.uuid,
 *     DSL.references(() => Category, "id")
 *   ),
 * }) {}
 * ```
 *
 * @param target - Thunk returning the target model (lazy for circular dependencies)
 * @param field - Target field name to reference (typically the primary key)
 * @param foreignKey - Optional FK constraint configuration (onDelete, onUpdate, name)
 * @returns A combinator that attaches FK reference metadata to the schema
 *
 * @since 1.0.0
 * @category reference combinators
 */
export const references =
  <
    Target extends ModelClass<unknown, DSL.Fields, string, Record<string, ColumnDef>, readonly string[], string>,
    TargetField extends string,
  >(
    target: () => Target,
    field: TargetField,
    foreignKey?: ForeignKeyConfig
  ) =>
  <A, I, R, C extends ColumnDef = never>(
    self: S.Schema<A, I, R> | DSLField<A, I, R, C>
  ): DSLField<A, I, R, ResolveColumnDef<S.Schema<A, I, R>, C>> => {
    // Get or create column metadata using existing helper
    const result = attachColumnDef(self, {});

    // Create FieldReference object with conditional spread for optional foreignKey
    // to satisfy exactOptionalPropertyTypes
    const ref: FieldReference<Target, TargetField> = {
      target,
      field,
      ...(P.isNotUndefined(foreignKey) && { foreignKey }),
    };

    // Attach FK metadata via symbol (dual storage pattern)
    (result as unknown as Record<symbol, unknown>)[ForeignKeySymbol] = ref;

    return result;
  };
