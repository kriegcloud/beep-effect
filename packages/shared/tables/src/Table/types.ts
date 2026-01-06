import type { BuildColumns } from "drizzle-orm";
import type * as pg from "drizzle-orm/pg-core";

/**
 * Custom merge type that:
 * 1. Flattens the intersection into a single mapped type (cleaner display)
 * 2. Gives defaults precedence (left side wins)
 * 3. Preserves Record<string, PgColumnBuilderBase> constraint for Drizzle
 *
 * Note: We can't use Types.MergeLeft here because its `infer` pattern
 * causes TypeScript to lose the structural constraint Drizzle requires.
 */
export type MergedColumns<
  Defaults extends Record<string, pg.PgColumnBuilderBase>,
  Custom extends Record<string, pg.PgColumnBuilderBase>,
> = {
  [K in keyof Defaults | keyof Custom]: K extends keyof Defaults
    ? Defaults[K]
    : K extends keyof Custom
      ? Custom[K]
      : never;
};

/**
 * Forces TypeScript to expand a type in hover tooltips.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Final table type parameterized by the MERGED columns directly.
 * By taking AllColumns as the parameter (not TColumnsMap), TypeScript
 * will display the full merged column set in hover tooltips.
 */
export type PgTableWithMergedColumns<
  TableName extends string,
  TAllColumns extends Record<string, pg.PgColumnBuilderBase>,
> = pg.PgTableWithColumns<{
  name: TableName;
  schema: undefined;
  columns: BuildColumns<TableName, TAllColumns, "pg">;
  dialect: "pg";
}>;
