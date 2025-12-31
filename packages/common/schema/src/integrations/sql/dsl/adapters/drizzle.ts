import { thunk } from "@beep/utils";
import type {
  $Type,
  BuildColumns,
  ColumnBuilderBase,
  HasDefault,
  IsAutoincrement,
  IsPrimaryKey,
  NotNull,
} from "drizzle-orm";
import { sql } from "drizzle-orm";
import type {
  PgBigInt53BuilderInitial,
  PgBooleanBuilderInitial,
  PgIntegerBuilderInitial,
  PgJsonbBuilderInitial,
  PgSerialBuilderInitial,
  PgTableWithColumns,
  PgTextBuilderInitial,
  PgTimestampBuilderInitial,
  PgUUIDBuilderInitial,
} from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";
import type { ColumnType } from "../literals";
import type { ModelStatics } from "../Model";
import { isNullable } from "../nullability";
import type { ColumnDef, DSL, ExtractEncodedType } from "../types";
import { isDSLVariantField } from "../types";

// ============================================================================
// Type-Level Drizzle Builder Mapping
// ============================================================================

/**
 * Config mapping ColumnType to corresponding Drizzle builder types.
 * This provides a single source of truth for the column type -> builder mapping.
 *
 * Note: The "integer" type has a special case for autoIncrement which is
 * handled separately in `DrizzleBaseBuilderFor`.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface DrizzleBuilderConfig<Name extends string> {
  readonly string: PgTextBuilderInitial<Name, [string, ...string[]]>;
  readonly number: PgIntegerBuilderInitial<Name>;
  readonly integer: PgIntegerBuilderInitial<Name>;
  readonly boolean: PgBooleanBuilderInitial<Name>;
  readonly datetime: PgTimestampBuilderInitial<Name>;
  readonly uuid: PgUUIDBuilderInitial<Name>;
  readonly json: PgJsonbBuilderInitial<Name>;
  readonly bigint: PgBigInt53BuilderInitial<Name>;
}

/**
 * Maps a ColumnType to its corresponding base Drizzle builder type.
 * This is the "untyped" builder before modifiers are applied.
 *
 * Uses `DrizzleBuilderConfig` as the source of truth for type mappings.
 * Special handling for "integer" with autoIncrement which uses `PgSerialBuilderInitial`.
 */
type DrizzleBaseBuilderFor<Name extends string, T extends ColumnType.Type, AI extends boolean> = T extends "integer" // Special case: integer with autoIncrement uses Serial
  ? AI extends true
    ? PgSerialBuilderInitial<Name>
    : DrizzleBuilderConfig<Name>["integer"]
  : // All other types use direct config lookup
    DrizzleBuilderConfig<Name>[T];

/**
 * Type-level helper to check if a type includes null or undefined.
 * Used to derive column nullability from the schema's encoded type.
 */
type IsEncodedNullable<T> = null extends T ? true : undefined extends T ? true : false;

/**
 * Applies NotNull modifier if the column is not nullable.
 * Primary keys get notNull: true. Nullability is derived from the schema's encoded type.
 * Serial/autoIncrement columns handle their own nullability.
 */
type ApplyNotNull<T extends ColumnBuilderBase, Col extends ColumnDef, EncodedType> = Col extends { primaryKey: true }
  ? NotNull<T>
  : Col extends { autoIncrement: true }
    ? T // Serial columns handle their own nullability
    : IsEncodedNullable<EncodedType> extends true
      ? T
      : NotNull<T>;

/**
 * Applies IsPrimaryKey modifier if the column is a primary key.
 */
type ApplyPrimaryKey<T extends ColumnBuilderBase, Col extends ColumnDef> = Col extends { primaryKey: true }
  ? IsPrimaryKey<T>
  : T;

/**
 * Applies HasDefault modifier if the column has any default value or is auto-incrementing.
 * Checks for all five default-related properties:
 * - autoIncrement: Serial columns have implicit default
 * - default: Static SQL default value
 * - $default: Alias for $defaultFn
 * - $defaultFn: Runtime default function
 * - $onUpdate / $onUpdateFn: Also counts as hasDefault (Drizzle behavior)
 */
type ApplyHasDefault<T extends ColumnBuilderBase, Col extends ColumnDef> = Col extends { autoIncrement: true }
  ? HasDefault<T>
  : Col extends { default: string }
    ? HasDefault<T>
    : Col extends { $default: () => unknown }
      ? HasDefault<T>
      : Col extends { $defaultFn: () => unknown }
        ? HasDefault<T>
        : Col extends { $onUpdate: () => unknown }
          ? HasDefault<T>
          : Col extends { $onUpdateFn: () => unknown }
            ? HasDefault<T>
            : T;

/**
 * Applies IsAutoincrement modifier if the column is auto-incrementing.
 */
type ApplyAutoincrement<T extends ColumnBuilderBase, Col extends ColumnDef> = Col extends { autoIncrement: true }
  ? IsAutoincrement<T>
  : T;

/**
 * Applies $Type modifier to set the column's TypeScript type.
 */
type Apply$Type<T extends ColumnBuilderBase, EncodedType> = $Type<T, EncodedType>;

/**
 * Composes all Drizzle builder modifiers in the correct order.
 * Order matters: notNull and primaryKey should be applied before $type.
 * Nullability is derived from the schema's EncodedType (checking for null | undefined).
 */
type DrizzleTypedBuilderFor<Name extends string, Col extends ColumnDef, EncodedType> = Apply$Type<
  ApplyAutoincrement<
    ApplyHasDefault<
      ApplyPrimaryKey<
        ApplyNotNull<
          DrizzleBaseBuilderFor<Name, Col["type"], Col extends { autoIncrement: true } ? true : false>,
          Col,
          EncodedType
        >,
        Col
      >,
      Col
    >,
    Col
  >,
  EncodedType
>;

/**
 * Maps a record of ColumnDefs to typed Drizzle builders using the original DSL fields.
 * Each column gets all appropriate modifiers applied based on its ColumnDef.
 */
type DrizzleTypedBuildersFor<Columns extends Record<string, ColumnDef>, Fields extends DSL.Fields> = {
  [K in keyof Columns & keyof Fields & string]: DrizzleTypedBuilderFor<K, Columns[K], ExtractEncodedType<Fields[K]>>;
};

// ============================================================================
// Runtime Column Builder
// ============================================================================

/**
 * Extracts AST.AST from a Schema or PropertySignature.
 * PropertySignature has a different AST type, so we need to extract the inner type.
 */
const extractAST = (schemaOrPS: S.Schema.All | S.PropertySignature.All): AST.AST => {
  if (S.isPropertySignature(schemaOrPS)) {
    // PropertySignature has ast of type PropertySignatureDeclaration | PropertySignatureTransformation
    const psAst = schemaOrPS.ast;
    if (psAst._tag === "PropertySignatureDeclaration") {
      return psAst.type;
    }
    // PropertySignatureTransformation - use the 'from' side for nullability
    return psAst.from.type;
  }
  return schemaOrPS.ast;
};

/**
 * Gets the AST from a DSL field for nullability analysis.
 * For VariantFields, we analyze the "select" variant's schema since that
 * represents what gets stored/retrieved from the database.
 */
const getFieldAST = (field: DSL.Fields[string]): AST.AST | null => {
  if (P.isNullable(field)) return null;

  // DSLVariantField: get the "select" variant's schema AST
  if (isDSLVariantField(field)) {
    const selectSchema = field.schemas.select;
    if (selectSchema && (S.isSchema(selectSchema) || S.isPropertySignature(selectSchema))) {
      return extractAST(selectSchema);
    }
    return null;
  }

  // Check for raw VariantSchema.Field (has .schemas property)
  if (P.hasProperty("schemas")(field) && P.isObject(field.schemas) && P.isNotNull(field.schemas)) {
    const schemas = field.schemas as Record<string, unknown>;
    const selectSchema = schemas.select;
    if (selectSchema && (S.isSchema(selectSchema) || S.isPropertySignature(selectSchema))) {
      return extractAST(selectSchema as S.Schema.All | S.PropertySignature.All);
    }
    return null;
  }

  // DSLField or plain Schema/PropertySignature: has .ast property directly
  if (S.isSchema(field) || S.isPropertySignature(field)) {
    return extractAST(field);
  }

  return null;
};

/**
 * Derives nullability from a DSL field by analyzing its schema AST.
 * Returns true if the field's schema can encode to null/undefined.
 */
const isFieldNullable = (field: DSL.Fields[string]): boolean => {
  const ast = getFieldAST(field);
  if (P.isNullable(ast)) return false;
  return isNullable(ast, "from");
};

/**
 * Builds a Drizzle column from a ColumnDef and its corresponding DSL field.
 * The column builder applies constraints in order, with .$type<T>() called last.
 * Nullability is derived from the field's schema AST, not from ColumnDef.
 * Note: .$type<T>() is purely type-level - it returns `this` at runtime.
 *
 * Default application order (following Drizzle semantics):
 * 1. Static `.default()` - SQL default evaluated by database
 * 2. Runtime `.$defaultFn()` / `.$default()` - Function called on INSERT
 * 3. Runtime `.$onUpdateFn()` / `.$onUpdate()` - Function called on UPDATE
 */
const columnBuilder = <ColumnName extends string, EncodedType>(
  name: ColumnName,
  def: ColumnDef,
  field: DSL.Fields[string]
) =>
  F.pipe(
    Match.value(def).pipe(
      Match.discriminatorsExhaustive("type")({
        string: thunk(pg.text(name)),
        number: thunk(pg.integer(name)),
        integer: thunk(def.autoIncrement ? pg.serial(name) : pg.integer(name)),
        boolean: thunk(pg.boolean(name)),
        datetime: thunk(pg.timestamp(name)),
        uuid: thunk(pg.uuid(name)),
        json: thunk(pg.jsonb(name)),
        bigint: thunk(pg.bigint(name, { mode: "bigint" })),
      })
    ),
    (column) => {
      // Apply constraints in order
      if (def.primaryKey) column = column.primaryKey();
      if (def.unique) column = column.unique();
      // Derive nullability from the field's schema AST
      const fieldIsNullable = isFieldNullable(field);
      if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();

      // Apply defaults in order: static first, then runtime functions
      // 1. Static SQL default (evaluated by database)
      // Use sql.raw to wrap string defaults as raw SQL expressions
      if (def.default !== undefined) {
        column = column.default(sql.raw(def.default) as never);
      }

      // 2. Runtime default function (called by Drizzle on INSERT)
      // $default is alias for $defaultFn - prefer $defaultFn if both present
      const runtimeDefaultFn = def.$defaultFn ?? def.$default;
      if (runtimeDefaultFn !== undefined) {
        column = column.$defaultFn(runtimeDefaultFn as never);
      }

      // 3. Runtime update function (called by Drizzle on UPDATE)
      // $onUpdate is alias for $onUpdateFn - prefer $onUpdateFn if both present
      const runtimeOnUpdateFn = def.$onUpdateFn ?? def.$onUpdate;
      if (runtimeOnUpdateFn !== undefined) {
        column = column.$onUpdateFn(runtimeOnUpdateFn as never);
      }

      // Apply .$type<T>() LAST - this is purely type-level at runtime
      // The type parameter is enforced at the type level via DrizzleTypedBuildersFor
      return column.$type<EncodedType>();
    }
  );

// ============================================================================
// toDrizzle Conversion
// ============================================================================

/**
 * Converts a DSL Model to a Drizzle PgTable with typed columns.
 *
 * Each column is typed using .$type<T>() where T is the Effect Schema's encoded type.
 * This ensures type-safe queries where Drizzle understands the actual TypeScript types
 * that will be stored in and retrieved from the database.
 *
 * The table name literal type is preserved via SnakeTag constraint, enabling
 * type-safe `db.query.<tableName>` access patterns.
 *
 * @example
 * ```typescript
 * // Define a Model with branded types and snake_case table name
 * class User extends Model<User, "user">("user")({
 *   id: Field(UserId.Schema, { column: { type: "uuid", primaryKey: true } }),
 *   email: Field(S.String, { column: { type: "string", unique: true } }),
 * }) {}
 *
 * // Convert to Drizzle table - columns are typed, table name is literal!
 * const users = toDrizzle(User);
 * // typeof users._.name is "user", not string
 *
 * // Type-safe queries
 * const result = await db.select().from(users);
 * // result[0].id is typed as UserId, not just string
 * ```
 */
export const toDrizzle = <
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  Fields extends DSL.Fields,
  M extends ModelStatics<TName, Columns, PK, Id, Fields>,
>(
  model: M
): PgTableWithColumns<{
  name: M["tableName"];
  schema: undefined;
  columns: BuildColumns<M["tableName"], DrizzleTypedBuildersFor<M["columns"], M["_fields"]>, "pg">;
  dialect: "pg";
}> =>
  pg.pgTable(
    model.tableName,
    F.pipe(
      model.columns,
      Struct.entries,
      A.map(([key, def]) => {
        // Get the corresponding DSL field for nullability derivation
        const field = model._fields[key];
        return [key, columnBuilder(key, def, field)] as const;
      }),
      A.reduce(
        {} as {
          [K in keyof DrizzleTypedBuildersFor<M["columns"], M["_fields"]>]: DrizzleTypedBuildersFor<
            M["columns"],
            M["_fields"]
          >[K];
        },
        (acc, [k, v]) => ({
          ...acc,
          [k]: v,
        })
      )
    )
  );
