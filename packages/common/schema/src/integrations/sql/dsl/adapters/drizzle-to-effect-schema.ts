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

type ColumnSchema<TColumn extends Drizzle.Column> = TColumn["dataType"] extends "custom"
  ? S.Schema<any>
  : TColumn["dataType"] extends "json"
    ? S.Schema<JsonValue>
    : TColumn extends { enumValues: [string, ...string[]] }
      ? Drizzle.Equal<TColumn["enumValues"], [string, ...string[]]> extends true
        ? S.Schema<string>
        : S.Schema<TColumn["enumValues"][number]>
      : TColumn["dataType"] extends "bigint"
        ? S.Schema<bigint, bigint>
        : TColumn["dataType"] extends "number"
          ? TColumn["columnType"] extends `PgBigInt${number}`
            ? S.Schema<bigint, number>
            : S.Schema<number, number>
          : TColumn["columnType"] extends "PgNumeric"
            ? S.Schema<number, string>
            : TColumn["columnType"] extends "PgUUID"
              ? S.Schema<string>
              : TColumn["columnType"] extends "PgDate"
                ? TColumn extends { mode: "string" }
                  ? S.Schema<string, string>
                  : S.Schema<Date, string>
                : TColumn["columnType"] extends "PgTimestamp"
                  ? TColumn extends { mode: "string" }
                    ? S.Schema<string, string>
                    : S.Schema<Date, string>
                  : TColumn["dataType"] extends "string"
                    ? S.Schema<string, string>
                    : TColumn["dataType"] extends "boolean"
                      ? S.Schema<boolean>
                      : TColumn["dataType"] extends "date"
                        ? TColumn extends { mode: "string" }
                          ? S.Schema<string>
                          : S.Schema<Date>
                        : S.Schema<any>;

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
  schemas: { [K in keyof Columns<TTable>]: S.Schema<any> }
) => S.Schema<any>;

type RefineArg<TTable extends Drizzle.Table> = S.Schema<any> | RefineFunction<TTable>;

// Clean refinement type without ugly satisfies
type TableRefine<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]?: RefineArg<TTable>;
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
  [K in keyof Columns<TTable>]: InsertProperty<Columns<TTable>[K], K & string>;
};

type SelectColumnSchemas<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]: SelectProperty<Columns<TTable>[K]>;
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
