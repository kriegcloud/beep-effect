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
import type {
  PgBigInt53BuilderInitial,
  PgBooleanBuilderInitial,
  PgColumnBuilderBase,
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
import type { AnyColumnDef, DSL, ExtractEncodedType } from "../types";
import { isDSLVariantField } from "../types";

// ============================================================================
// Type-Level Drizzle Builder Mapping
// ============================================================================

/**
 * Maps a ColumnType to its corresponding base Drizzle builder type.
 * This is the "untyped" builder before modifiers are applied.
 */
type DrizzleBaseBuilderFor<Name extends string, T extends ColumnType.Type, AI extends boolean> = T extends "string"
  ? PgTextBuilderInitial<Name, [string, ...string[]]>
  : T extends "number"
    ? PgIntegerBuilderInitial<Name>
    : T extends "integer"
      ? AI extends true
        ? PgSerialBuilderInitial<Name>
        : PgIntegerBuilderInitial<Name>
      : T extends "boolean"
        ? PgBooleanBuilderInitial<Name>
        : T extends "datetime"
          ? PgTimestampBuilderInitial<Name>
          : T extends "uuid"
            ? PgUUIDBuilderInitial<Name>
            : T extends "json"
              ? PgJsonbBuilderInitial<Name>
              : T extends "bigint"
                ? PgBigInt53BuilderInitial<Name>
                : never;

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
type ApplyNotNull<T extends ColumnBuilderBase, Col extends AnyColumnDef, EncodedType> = Col extends { primaryKey: true }
  ? NotNull<T>
  : Col extends { autoIncrement: true }
    ? T // Serial columns handle their own nullability
    : IsEncodedNullable<EncodedType> extends true
      ? T
      : NotNull<T>;

/**
 * Applies IsPrimaryKey modifier if the column is a primary key.
 */
type ApplyPrimaryKey<T extends ColumnBuilderBase, Col extends AnyColumnDef> = Col extends { primaryKey: true }
  ? IsPrimaryKey<T>
  : T;

/**
 * Applies HasDefault modifier if the column has a default value or is auto-incrementing.
 */
type ApplyHasDefault<T extends ColumnBuilderBase, Col extends AnyColumnDef> = Col extends { autoIncrement: true }
  ? HasDefault<T>
  : Col extends { defaultValue: string | (() => string) }
    ? HasDefault<T>
    : T;

/**
 * Applies IsAutoincrement modifier if the column is auto-incrementing.
 */
type ApplyAutoincrement<T extends ColumnBuilderBase, Col extends AnyColumnDef> = Col extends { autoIncrement: true }
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
type DrizzleTypedBuilderFor<Name extends string, Col extends AnyColumnDef, EncodedType> = Apply$Type<
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
type DrizzleTypedBuildersFor<Columns extends Record<string, AnyColumnDef>, Fields extends DSL.Fields> = {
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
  if (field == null) return null;

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
  if (ast == null) return false;
  return isNullable(ast, "from");
};

/**
 * Builds a Drizzle column from a ColumnDef and its corresponding DSL field.
 * The column builder applies constraints in order, with .$type<T>() called last.
 * Nullability is derived from the field's schema AST, not from ColumnDef.
 * Note: .$type<T>() is purely type-level - it returns `this` at runtime.
 */
const columnBuilder = <ColumnName extends string, EncodedType>(
  name: ColumnName,
  def: AnyColumnDef,
  field: DSL.Fields[string]
): PgColumnBuilderBase =>
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
 * @example
 * ```typescript
 * // Define a Model with branded types
 * class User extends Model<User>("User")({
 *   id: Field(UserId.Schema, { column: { type: "uuid", primaryKey: true } }),
 *   email: Field(S.String, { column: { type: "string", unique: true } }),
 * }) {}
 *
 * // Convert to Drizzle table - columns are typed!
 * const users = toDrizzle(User);
 *
 * // Type-safe queries
 * const result = await db.select().from(users);
 * // result[0].id is typed as UserId, not just string
 * ```
 */
export const toDrizzle = <
  TName extends string,
  Columns extends Record<string, AnyColumnDef>,
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
