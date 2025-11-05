import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as Drizzle from "drizzle-orm";
import * as DrizzleMysql from "drizzle-orm/mysql-core";
import * as DrizzlePg from "drizzle-orm/pg-core";
import * as DrizzleSqlite from "drizzle-orm/sqlite-core";
import * as S from "effect/Schema";

type Columns<TTable extends Drizzle.Table> = TTable["_"]["columns"] extends infer TColumns extends Record<
  string,
  Drizzle.Column<UnsafeTypes.UnsafeAny>
>
  ? TColumns
  : never;

type PropertySignatureEncoded<T> = T extends S.PropertySignature<
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  infer From,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny
>
  ? From
  : never;

type PropertySignatureType<T> = T extends S.PropertySignature<
  UnsafeTypes.UnsafeAny,
  infer To,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny,
  UnsafeTypes.UnsafeAny
>
  ? To
  : never;

type InsertRefineArg<TTable extends Drizzle.Table, Col extends keyof Columns<TTable>> =
  | S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
  | ((
      s: {
        [S in keyof InsertColumnPropertySignatures<TTable>]: InsertColumnPropertySignatures<TTable>[S] extends S.PropertySignature<
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny
        >
          ? S.Schema<
              Exclude<PropertySignatureEncoded<InsertColumnPropertySignatures<TTable>[S]>, undefined | null>,
              Exclude<PropertySignatureType<InsertColumnPropertySignatures<TTable>[S]>, undefined | null>
            >
          : InsertColumnPropertySignatures<TTable>[S];
      }
    ) => InsertColumnPropertySignatures<TTable>[Col] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny
    >
      ? S.Schema<
          Exclude<PropertySignatureEncoded<InsertColumnPropertySignatures<TTable>[Col]>, undefined | null>,
          UnsafeTypes.UnsafeAny
        >
      : S.Schema<
          Exclude<S.Schema.Encoded<InsertColumnPropertySignatures<TTable>[Col]>, undefined | null>,
          UnsafeTypes.UnsafeAny
        >);

type SelectRefineArg<TTable extends Drizzle.Table, Col extends keyof Columns<TTable>> =
  | S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
  | ((
      s: {
        [S in keyof InsertColumnPropertySignatures<TTable>]: InsertColumnPropertySignatures<TTable>[S] extends S.PropertySignature<
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny,
          UnsafeTypes.UnsafeAny
        >
          ? S.Schema<
              Exclude<PropertySignatureEncoded<InsertColumnPropertySignatures<TTable>[S]>, undefined | null>,
              Exclude<PropertySignatureType<InsertColumnPropertySignatures<TTable>[S]>, undefined | null>
            >
          : InsertColumnPropertySignatures<TTable>[S];
      }
    ) => InsertColumnPropertySignatures<TTable>[Col] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny
    >
      ? S.Schema<
          Exclude<PropertySignatureEncoded<InsertColumnPropertySignatures<TTable>[Col]>, undefined | null>,
          UnsafeTypes.UnsafeAny
        >
      : S.Schema<
          Exclude<S.Schema.Encoded<InsertColumnPropertySignatures<TTable>[Col]>, undefined | null>,
          UnsafeTypes.UnsafeAny
        >);

type InsertRefine<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]?: InsertRefineArg<TTable, K> | undefined;
};

type SelectRefine<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]?: SelectRefineArg<TTable, K> | undefined;
};

type GetSchemaForType<TColumn extends Drizzle.Column> = TColumn["_"]["dataType"] extends infer TDataType
  ? TDataType extends "custom"
    ? S.Schema<UnsafeTypes.UnsafeAny>
    : TDataType extends "json"
      ? S.Schema<BS.Json.Type>
      : TColumn extends { enumValues: [string, ...Array<string>] }
        ? Drizzle.Equal<TColumn["enumValues"], [string, ...Array<string>]> extends true
          ? S.Schema<string>
          : S.Schema<TColumn["enumValues"][number]>
        : TDataType extends "array"
          ? S.Schema<null | ReadonlyArray<
              Drizzle.Assume<TColumn["_"], { baseColumn: Drizzle.Column }>["baseColumn"]["_"]["data"]
            >>
          : TDataType extends "bigint"
            ? S.Schema<bigint>
            : TDataType extends "number"
              ? S.Schema<number>
              : TDataType extends "string"
                ? S.Schema<string>
                : TDataType extends "boolean"
                  ? S.Schema<boolean>
                  : TDataType extends "date"
                    ? S.Schema<Date>
                    : S.Schema<UnsafeTypes.UnsafeAny>
  : never;

type MapInsertColumnToPropertySignature<TColumn extends Drizzle.Column> = TColumn["_"]["notNull"] extends false
  ? S.PropertySignature<
      "?:",
      S.Schema.Type<GetSchemaForType<TColumn>> | undefined | null,
      TColumn["_"]["name"],
      "?:",
      S.Schema.Encoded<GetSchemaForType<TColumn>> | undefined | null,
      false,
      never
    >
  : TColumn["_"]["hasDefault"] extends true
    ? S.PropertySignature<
        "?:",
        S.Schema.Type<GetSchemaForType<TColumn>> | undefined,
        TColumn["_"]["name"],
        "?:",
        S.Schema.Encoded<GetSchemaForType<TColumn>> | undefined,
        true,
        never
      >
    : GetSchemaForType<TColumn>;

type MapSelectColumnToPropertySignature<TColumn extends Drizzle.Column> = TColumn["_"]["notNull"] extends false
  ? S.Schema<S.Schema.Type<GetSchemaForType<TColumn>> | null>
  : GetSchemaForType<TColumn>;

type InsertColumnPropertySignatures<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]: MapInsertColumnToPropertySignature<Columns<TTable>[K]>;
};

type SelectColumnPropertySignatures<TTable extends Drizzle.Table> = {
  [K in keyof Columns<TTable>]: MapSelectColumnToPropertySignature<Columns<TTable>[K]>;
};

type PropertySignatureReplaceType<S, ReplaceWith> = S extends S.PropertySignature<
  infer TokenType,
  UnsafeTypes.UnsafeAny,
  infer Name,
  infer TokenEncoded,
  infer Encoded,
  infer HasDefault,
  infer R
>
  ? S.PropertySignature<TokenType, ReplaceWith, Name, TokenEncoded, Encoded, HasDefault, R>
  : never;

type CarryOverNull<From, To> = null extends From ? To | null : To;
type CarryOverUndefined<From, To> = undefined extends From ? To | undefined : To;

type CarryOverOptionality<From, To> = CarryOverNull<From, CarryOverUndefined<From, To>>;

type BuildInsertSchema<TTable extends Drizzle.Table, TRefine extends InsertRefine<TTable> | {} = {}> = S.Struct<
  InsertColumnPropertySignatures<TTable> & {
    [K in keyof TRefine & string]: InsertColumnPropertySignatures<TTable>[K] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny
    >
      ? TRefine[K] extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
        ? S.Schema<
            CarryOverOptionality<
              PropertySignatureType<InsertColumnPropertySignatures<TTable>[K]>,
              S.Schema.Type<TRefine[K]>
            >
          >
        : TRefine[K] extends (...a: Array<UnsafeTypes.UnsafeAny>) => UnsafeTypes.UnsafeAny
          ? PropertySignatureReplaceType<
              InsertColumnPropertySignatures<TTable>[K],
              CarryOverOptionality<
                PropertySignatureType<InsertColumnPropertySignatures<TTable>[K]>,
                S.Schema.Type<ReturnType<TRefine[K]>>
              >
            >
          : never
      : TRefine[K];
  }
>;

type BuildSelectSchema<TTable extends Drizzle.Table, TRefine extends InsertRefine<TTable> | {} = {}> = S.Struct<
  {
    [K in keyof SelectColumnPropertySignatures<TTable>]: SelectColumnPropertySignatures<TTable>[K];
  } & {
    [K in keyof TRefine & string]: SelectColumnPropertySignatures<TTable>[K] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny
    >
      ? TRefine[K] extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
        ? S.Schema<
            CarryOverOptionality<
              PropertySignatureType<SelectColumnPropertySignatures<TTable>[K]>,
              S.Schema.Type<TRefine[K]>
            >
          >
        : TRefine[K] extends (...a: Array<UnsafeTypes.UnsafeAny>) => UnsafeTypes.UnsafeAny
          ? PropertySignatureReplaceType<
              SelectColumnPropertySignatures<TTable>[K],
              CarryOverOptionality<
                PropertySignatureType<SelectColumnPropertySignatures<TTable>[K]>,
                S.Schema.Type<ReturnType<TRefine[K]>>
              >
            >
          : never
      : TRefine[K];
  }
>;

export function createInsertSchema<TTable extends Drizzle.Table, TRefine extends InsertRefine<TTable>>(
  table: TTable,
  refine?:
    | {
        [K in keyof TRefine]: K extends keyof TTable["_"]["columns"]
          ? TRefine[K]
          : Drizzle.DrizzleTypeError<`Column '${K & string}' does not exist in table '${TTable["_"]["name"]}'`>;
      }
    | undefined
): BuildInsertSchema<TTable, Drizzle.Equal<TRefine, InsertRefine<TTable>> extends true ? {} : TRefine> {
  const columns = Drizzle.getTableColumns(table);
  const columnEntries = Object.entries(columns);

  let schemaEntries = Object.fromEntries(
    columnEntries.map(([name, column]) => {
      return [name, mapColumnToSchema(column)];
    })
  );

  if (refine) {
    schemaEntries = Object.assign(
      schemaEntries,
      Object.fromEntries(
        Object.entries(refine).map(([name, refineColumn]) => {
          return [
            name,
            typeof refineColumn === "function" && !S.isSchema(refineColumn)
              ? refineColumn(schemaEntries as UnsafeTypes.UnsafeAny)
              : refineColumn,
          ];
        })
      )
    );
  }

  for (const [name, column] of columnEntries) {
    if (!column.notNull) {
      schemaEntries[name] = S.optional(S.NullOr(schemaEntries[name]!)) as UnsafeTypes.UnsafeAny;
    } else if (column.hasDefault) {
      schemaEntries[name] = S.optional(schemaEntries[name]!) as UnsafeTypes.UnsafeAny;
    }
  }

  return S.Struct(schemaEntries) as UnsafeTypes.UnsafeAny;
}

export function createSelectSchema<TTable extends Drizzle.Table, TRefine extends SelectRefine<TTable>>(
  table: TTable,
  refine?:
    | {
        [K in keyof TRefine]: K extends keyof TTable["_"]["columns"]
          ? TRefine[K]
          : Drizzle.DrizzleTypeError<`Column '${K & string}' does not exist in table '${TTable["_"]["name"]}'`>;
      }
    | undefined
): BuildSelectSchema<TTable, Drizzle.Equal<TRefine, SelectRefine<TTable>> extends true ? {} : TRefine> {
  const columns = Drizzle.getTableColumns(table);
  const columnEntries = Object.entries(columns);

  let schemaEntries = Object.fromEntries(
    columnEntries.map(([name, column]) => {
      return [name, mapColumnToSchema(column)];
    })
  );

  if (refine) {
    schemaEntries = Object.assign(
      schemaEntries,
      Object.fromEntries(
        Object.entries(refine).map(([name, refineColumn]) => {
          return [
            name,
            typeof refineColumn === "function" && !S.isSchema(refineColumn)
              ? refineColumn(schemaEntries as UnsafeTypes.UnsafeAny)
              : refineColumn,
          ];
        })
      )
    );
  }

  for (const [name, column] of columnEntries) {
    if (!column.notNull) {
      schemaEntries[name] = S.NullOr(schemaEntries[name]!);
    }
  }

  return S.Struct(schemaEntries) as UnsafeTypes.UnsafeAny;
}

function mapColumnToSchema(column: Drizzle.Column): S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> {
  let type: S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> | undefined;

  if (isWithEnum(column)) {
    type = column.enumValues.length ? S.Literal(...column.enumValues) : S.String;
  }

  if (!type) {
    if (Drizzle.is(column, DrizzlePg.PgUUID)) {
      type = S.UUID;
    } else if (column.dataType === "custom") {
      type = S.Any;
    } else if (column.dataType === "json") {
      type = BS.Json;
    } else if (column.dataType === "array") {
      type = S.Array(
        mapColumnToSchema((column as DrizzlePg.PgArray<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>).baseColumn)
      );
    } else if (column.dataType === "number") {
      type = S.Number;
    } else if (column.dataType === "bigint") {
      type = S.BigIntFromSelf;
    } else if (column.dataType === "boolean") {
      type = S.Boolean;
    } else if (column.dataType === "date") {
      type = S.DateFromSelf;
    } else if (column.dataType === "string") {
      let sType = S.String;

      if (
        (Drizzle.is(column, DrizzlePg.PgChar) ||
          Drizzle.is(column, DrizzlePg.PgVarchar) ||
          Drizzle.is(column, DrizzleMysql.MySqlVarChar) ||
          Drizzle.is(column, DrizzleMysql.MySqlVarBinary) ||
          Drizzle.is(column, DrizzleMysql.MySqlChar) ||
          Drizzle.is(column, DrizzleSqlite.SQLiteText)) &&
        typeof column.length === "number"
      ) {
        sType = sType.pipe(S.maxLength(column.length));
      }

      type = sType;
    }
  }

  if (!type) {
    type = S.Any;
  }

  return type;
}

function isWithEnum(column: Drizzle.Column): column is typeof column & { enumValues: [string, ...Array<string>] } {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
