import type { Prettify } from "@beep/types";
import type { Schema } from "effect";

import type { PgDSL } from "../schema/state/pg/db-schema/mod.ts";

export type DecodedValuesForTableAll<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = {
  [K in keyof GetColumns<TSchema, TTableName>]: Schema.Schema.Type<GetColumn<TSchema, TTableName, K>["schema"]>;
};

export type DecodedValuesForTablePretty<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = Prettify<
  DecodedValuesForTable<TSchema, TTableName>
>;

export type DecodedValuesForTable<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = Partial<
  Pick<DecodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>
> &
  Omit<DecodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>;

export type DecodedValuesForTableOrNull<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = NullableObj<
  Pick<DecodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>
> &
  Omit<DecodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>;

export type WhereValuesForTable<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = PartialOrNull<{
  [K in keyof DecodedValuesForTableAll<TSchema, TTableName>]: WhereValueForDecoded<
    DecodedValuesForTableAll<TSchema, TTableName>[K]
  >;
}>;

export type WhereValueForDecoded<TDecoded> = TDecoded | { op: WhereOp; val: TDecoded } | { op: "in"; val: TDecoded[] };
export type WhereOp = ">" | "<" | "=";

export const isValidWhereOp = (op: string): op is WhereOp => {
  const validWhereOps = [">", "<", "="];
  return validWhereOps.includes(op);
};

export type EncodedValuesForTableAll<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = {
  [K in keyof GetColumns<TSchema, TTableName>]: Schema.Schema.Type<GetColumn<TSchema, TTableName, K>["schema"]>;
};

export type EncodedValuesForTable<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = Partial<
  Pick<EncodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>
> &
  Omit<EncodedValuesForTableAll<TSchema, TTableName>, GetNullableColumnNamesForTable<TSchema, TTableName>>;

export type GetNullableColumnNamesForTable<TSchema extends PgDSL.DbSchema, TTableName extends keyof TSchema> = keyof {
  [K in keyof GetColumns<TSchema, TTableName> as GetColumn<TSchema, TTableName, K>["nullable"] extends true
    ? K
    : never]: {};
};

export type GetColumns<
  TSchema extends PgDSL.DbSchema,
  TTableName extends keyof TSchema,
> = TSchema[TTableName]["columns"];

export type GetColumn<
  TSchema extends PgDSL.DbSchema,
  TTableName extends keyof TSchema,
  TColumnName extends keyof TSchema[TTableName]["columns"],
> = TSchema[TTableName]["columns"][TColumnName];

export type DecodedValuesForColumnsAll<TColumns extends PgDSL.Columns> = {
  [K in keyof TColumns]: Schema.Schema.Type<TColumns[K]["schema"]>;
};

export type DecodedValuesForColumns<TColumns extends PgDSL.Columns> = Partial<
  Pick<DecodedValuesForColumnsAll<TColumns>, GetNullableColumnNames<TColumns>>
> &
  Omit<DecodedValuesForColumnsAll<TColumns>, GetNullableColumnNames<TColumns>>;

export type EncodedValuesForColumnsAll<TColumns extends PgDSL.Columns> = {
  [K in keyof TColumns]: Schema.Schema.Encoded<TColumns[K]["schema"]>;
};

export type EncodedValuesForColumns<TColumns extends PgDSL.Columns> = Partial<
  Pick<EncodedValuesForColumnsAll<TColumns>, GetNullableColumnNames<TColumns>>
> &
  Omit<EncodedValuesForColumnsAll<TColumns>, GetNullableColumnNames<TColumns>>;

export type WhereValuesForColumns<TColumns extends PgDSL.Columns> = PartialOrNull<{
  [K in keyof EncodedValuesForColumns<TColumns>]: WhereValueForDecoded<DecodedValuesForColumnsAll<TColumns>[K]>;
}>;

export type GetNullableColumnNames<TColumns extends PgDSL.Columns> = keyof {
  [K in keyof TColumns as TColumns[K] extends PgDSL.ColumnDefinition<any, true> ? K : never]: unknown;
};

export type PartialOrNull<T> = { [P in keyof T]?: T[P] | null };

export type NullableObj<T> = { [P in keyof T]: T[P] | null };
