import * as Drizzle from "drizzle-orm";
import * as DrizzleMysql from "drizzle-orm/mysql-core";
import * as DrizzlePg from "drizzle-orm/pg-core";
import * as DrizzleSqlite from "drizzle-orm/sqlite-core";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

// Core utility types - simplified
type Columns<TTable extends Drizzle.Table> = TTable["_"]["columns"];

/**
 * Config mapping Drizzle dataType to corresponding Effect Schema types.
 * This provides a single source of truth for simple dataType -> Schema mappings.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface DataTypeSchemaConfig {
  readonly custom: S.Schema<any>;
  readonly json: S.Schema<JsonValue>;
  readonly bigint: S.Schema<bigint, bigint>;
  readonly number: S.Schema<number, number>;
  readonly string: S.Schema<string, string>;
  readonly boolean: S.Schema<boolean>;
}

/**
 * Config mapping specific Drizzle columnType to corresponding Effect Schema types.
 * Used for columnType-specific overrides that take precedence over dataType mapping.
 *
 * @since 1.0.0
 * @category type-level
 * @internal
 */
interface ColumnTypeSchemaConfig {
  readonly PgNumeric: S.Schema<number, string>;
  readonly PgUUID: S.Schema<string>;
}

/**
 * Schema types for date/timestamp columns based on mode.
 * @internal
 */
interface DateModeSchemaConfig {
  readonly string: S.Schema<string, string>;
  readonly date: S.Schema<Date, string>;
}

/**
 * Helper type for date/timestamp columns that respect the mode setting.
 * @internal
 */
type DateColumnSchema<TColumn extends Drizzle.Column> = TColumn extends { readonly mode: "string" }
  ? DateModeSchemaConfig["string"]
  : DateModeSchemaConfig["date"];

/**
 * Helper type for generic date dataType columns.
 * @internal
 */
type GenericDateSchema<TColumn extends Drizzle.Column> = TColumn extends { readonly mode: "string" }
  ? S.Schema<string>
  : S.Schema<Date>;

/**
 * Derives the Effect Schema type from a Drizzle column.
 *
 * Uses config interfaces as the source of truth for type mappings.
 * Complex cases (enums, PgBigInt pattern, date modes) use targeted conditionals.
 *
 * Priority order:
 * 1. Special dataTypes (custom, json)
 * 2. Enum columns (with non-generic enumValues)
 * 3. bigint and number dataTypes (with PgBigInt pattern check)
 * 4. Specific columnTypes (PgNumeric, PgUUID, PgDate, PgTimestamp)
 * 5. Simple dataTypes (string, boolean, date)
 * 6. Fallback to S.Schema<any>
 *
 * @since 1.0.0
 * @category type-level
 */
type ColumnSchema<TColumn extends Drizzle.Column> =
  // 1. Special dataTypes - use config
  TColumn["dataType"] extends "custom"
    ? DataTypeSchemaConfig["custom"]
    : TColumn["dataType"] extends "json"
      ? DataTypeSchemaConfig["json"]
      : // 2. Enum columns - check for non-generic enumValues
        TColumn extends { enumValues: [string, ...string[]] }
        ? Drizzle.Equal<TColumn["enumValues"], [string, ...string[]]> extends true
          ? S.Schema<string>
          : S.Schema<TColumn["enumValues"][number]>
        : // 3. bigint dataType - use config
          TColumn["dataType"] extends "bigint"
          ? DataTypeSchemaConfig["bigint"]
          : // 4. number dataType with PgBigInt pattern check
            TColumn["dataType"] extends "number"
            ? TColumn["columnType"] extends `PgBigInt${number}`
              ? S.Schema<bigint, number>
              : DataTypeSchemaConfig["number"]
            : // 5. Specific columnTypes - use config where possible
              TColumn["columnType"] extends "PgNumeric"
              ? ColumnTypeSchemaConfig["PgNumeric"]
              : TColumn["columnType"] extends "PgUUID"
                ? ColumnTypeSchemaConfig["PgUUID"]
                : TColumn["columnType"] extends "PgDate"
                  ? DateColumnSchema<TColumn>
                  : TColumn["columnType"] extends "PgTimestamp"
                    ? DateColumnSchema<TColumn>
                    : // 6. Simple dataTypes - use config
                      TColumn["dataType"] extends "string"
                      ? DataTypeSchemaConfig["string"]
                      : TColumn["dataType"] extends "boolean"
                        ? DataTypeSchemaConfig["boolean"]
                        : TColumn["dataType"] extends "date"
                          ? GenericDateSchema<TColumn>
                          : // 7. Fallback
                            S.Schema<any>;

// Simplified JSON types to prevent inference explosion
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { readonly [key: string]: unknown }; // Match S.Record output
type JsonArray = readonly unknown[]; // Match S.Array output
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Non-recursive JSON schema to avoid type inference explosion
export const JsonValue = S.Union(
  S.String,
  S.Number,
  S.Boolean,
  S.Null,
  S.Record({ key: S.String, value: S.Unknown }),
  S.Array(S.Unknown)
) satisfies S.Schema<JsonValue>;

// Simplified refinement types
type RefineFunction<TTable extends Drizzle.Table> = (
  schemas: { readonly [K in keyof Columns<TTable>]: S.Schema<any> }
) => S.Schema<any>;

type RefineArg<TTable extends Drizzle.Table> = S.Schema<any> | RefineFunction<TTable>;

// Clean refinement type without ugly satisfies
type TableRefine<TTable extends Drizzle.Table> = {
  readonly [K in keyof Columns<TTable>]?: RefineArg<TTable>;
};

// Property signature builders - simplified
type InsertProperty<TColumn extends Drizzle.Column, TKey extends string> = TColumn["_"]["notNull"] extends false
  ? S.PropertySignature<
      "?:",
      S.Schema.Type<ColumnSchema<TColumn>> | null | undefined,
      TKey,
      "?:",
      S.Schema.Encoded<ColumnSchema<TColumn>> | null | undefined,
      false,
      never
    >
  : TColumn["_"]["hasDefault"] extends true
    ? S.PropertySignature<
        "?:",
        S.Schema.Type<ColumnSchema<TColumn>> | undefined,
        TKey,
        "?:",
        S.Schema.Encoded<ColumnSchema<TColumn>> | undefined,
        true,
        never
      >
    : ColumnSchema<TColumn>;

type SelectProperty<TColumn extends Drizzle.Column> = TColumn["_"]["notNull"] extends false
  ? S.Schema<S.Schema.Type<ColumnSchema<TColumn>> | null>
  : ColumnSchema<TColumn>;

// Base schema builders
type InsertColumnSchemas<TTable extends Drizzle.Table> = {
  readonly [K in keyof Columns<TTable>]: InsertProperty<Columns<TTable>[K], K & string>;
};

type SelectColumnSchemas<TTable extends Drizzle.Table> = {
  readonly [K in keyof Columns<TTable>]: SelectProperty<Columns<TTable>[K]>;
};

// Refined schema builders - controlled complexity
type BuildInsertSchema<TTable extends Drizzle.Table, TRefine = {}> = S.Struct<InsertColumnSchemas<TTable> & TRefine>;

type BuildSelectSchema<TTable extends Drizzle.Table, TRefine = {}> = S.Struct<SelectColumnSchemas<TTable> & TRefine>;

// Clean API functions
export function createInsertSchema<TTable extends Drizzle.Table, TRefine extends TableRefine<TTable> = {}>(
  table: TTable,
  refine?: TRefine
): BuildInsertSchema<TTable, TRefine> {
  const columns = Drizzle.getTableColumns(table);
  const columnEntries = Struct.entries(columns);

  let schemaEntries: Record<string, S.Schema.All | S.PropertySignature.All> = R.fromEntries(
    A.map(columnEntries, ([name, column]) => [name, mapColumnToSchema(column)] as const)
  );

  // Apply refinements
  if (refine) {
    const refinedEntries = F.pipe(
      refine,
      Struct.entries,
      A.map(
        ([name, refineColumn]) =>
          [
            name,
            P.isFunction(refineColumn) && !S.isSchema(refineColumn) && !S.isPropertySignature(refineColumn)
              ? refineColumn(schemaEntries as any)
              : refineColumn,
          ] as const
      )
    );

    schemaEntries = Object.assign(schemaEntries, R.fromEntries(refinedEntries));
  }

  // Apply insert-specific optionality rules
  for (const [name, column] of columnEntries) {
    if (!column.notNull) {
      schemaEntries[name] = S.optional(S.NullOr(schemaEntries[name] as S.Schema.All));
    } else if (column.hasDefault) {
      schemaEntries[name] = S.optional(schemaEntries[name] as S.Schema.All);
    }
  }

  return S.Struct(schemaEntries) as any;
}

export function createSelectSchema<TTable extends Drizzle.Table, TRefine extends TableRefine<TTable> = {}>(
  table: TTable,
  refine?: TRefine
): BuildSelectSchema<TTable, TRefine> {
  const columns = Drizzle.getTableColumns(table);
  const columnEntries = Struct.entries(columns);

  let schemaEntries: Record<string, S.Schema.All | S.PropertySignature.All> = F.pipe(
    columnEntries,
    A.map(([name, column]) => [name, mapColumnToSchema(column)] as const),
    A.reduce({} as Record<string, S.Schema.All | S.PropertySignature.All>, (acc, [name, column]) => ({
      ...acc,
      [name]: column,
    }))
  );
  // Apply refinements
  if (refine) {
    const refinedEntries = F.pipe(
      refine,
      Struct.entries,
      A.map(
        ([name, refineColumn]) =>
          [
            name,
            P.isFunction(refineColumn) && !S.isSchema(refineColumn) && !S.isPropertySignature(refineColumn)
              ? refineColumn(schemaEntries as any)
              : refineColumn,
          ] as const
      )
    );

    schemaEntries = Object.assign(schemaEntries, R.fromEntries(refinedEntries));
  }

  // Apply select-specific nullability rules
  for (const [name, column] of columnEntries) {
    if (!column.notNull) {
      schemaEntries[name] = S.NullOr(schemaEntries[name] as S.Schema.All);
    }
  }

  return S.Struct(schemaEntries) as any;
}

// Helper function to check if a column has a mode property
function hasMode(column: any): column is { readonly mode: string } {
  return P.isObject(column) && P.isNotNull(column) && P.hasProperty("mode")(column) && P.isString(column.mode);
}

function mapColumnToSchema(column: Drizzle.Column): S.Schema<any, any> {
  let type: S.Schema<any, any> | undefined;

  if (isWithEnum(column)) {
    type = column.enumValues.length ? S.Literal(...column.enumValues) : S.String;
  }

  if (!type) {
    if (Drizzle.is(column, DrizzlePg.PgUUID)) {
      type = S.UUID;
    } else if (column.dataType === "custom") {
      type = S.Any;
    } else if (column.dataType === "json") {
      type = JsonValue;
    } else if (column.dataType === "array") {
      type = S.Array(mapColumnToSchema((column as DrizzlePg.PgArray<any, any>).baseColumn));
    } else if (column.dataType === "number") {
      type = S.Number;
    } else if (column.dataType === "bigint") {
      type = S.BigIntFromSelf;
    } else if (column.dataType === "boolean") {
      type = S.Boolean;
    } else if (column.dataType === "date") {
      type = hasMode(column) && column.mode === "string" ? S.String : S.DateFromSelf;
    } else if (column.dataType === "string") {
      // Additional check: if it's a PgTimestamp or PgDate masquerading as string
      if (Drizzle.is(column, DrizzlePg.PgTimestamp)) {
        type = hasMode(column) && column.mode === "string" ? S.String : S.DateFromSelf;
      } else if (Drizzle.is(column, DrizzlePg.PgDate)) {
        type = hasMode(column) && column.mode === "string" ? S.String : S.DateFromSelf;
      } else {
        let sType = S.String;
        if (
          (Drizzle.is(column, DrizzlePg.PgChar) ||
            Drizzle.is(column, DrizzlePg.PgVarchar) ||
            Drizzle.is(column, DrizzleMysql.MySqlVarChar) ||
            Drizzle.is(column, DrizzleMysql.MySqlVarBinary) ||
            Drizzle.is(column, DrizzleMysql.MySqlChar) ||
            Drizzle.is(column, DrizzleSqlite.SQLiteText)) &&
          P.isNumber(column.length)
        ) {
          sType = sType.pipe(S.maxLength(column.length));
        }
        type = sType;
      }
    }
  }

  if (!type) {
    type = S.Any; // fallback
  }

  return type;
}

function isWithEnum(column: Drizzle.Column): column is typeof column & { enumValues: [string, ...string[]] } {
  return P.hasProperty("enumValues")(column) && A.isArray(column.enumValues) && column.enumValues.length > 0;
}
