import type { BuildColumns, ColumnBuilderBase } from "drizzle-orm";
import type * as sqlite from "drizzle-orm/sqlite-core";

/**
 * Structural contract required by `Table.make`.
 *
 * The shared-domain `EntityId` schemas satisfy this shape, and tests can use
 * light-weight stand-ins without dragging domain dependencies into the tables
 * package itself.
 *
 * @since 0.0.0
 * @category Types
 */
export interface EntityIdLike<
  TTag extends string = string,
  TTableName extends string = string,
  TSlice extends string = string,
  TType = number,
> {
  readonly _tag: TTag;
  readonly slice: TSlice;
  readonly Type?: TType;
  readonly tableName: TTableName;
}

/**
 * Decoded entity-id type extracted from an `EntityIdLike`.
 *
 * @since 0.0.0
 * @category Types
 */
export type EntityIdType<TEntityId extends EntityIdLike> = Exclude<TEntityId["Type"], undefined>;

/**
 * Merge type where the left-hand side wins on key conflicts.
 *
 * @since 0.0.0
 * @category Types
 */
export type MergedColumns<
  Defaults extends Record<string, ColumnBuilderBase>,
  Custom extends Record<string, ColumnBuilderBase>,
> = {
  [K in keyof Defaults | keyof Custom]: K extends keyof Defaults
    ? Defaults[K]
    : K extends keyof Custom
      ? Custom[K]
      : never;
};

/**
 * Force TypeScript to expand a type for hover-friendly display.
 *
 * @since 0.0.0
 * @category Types
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Final SQLite table type parameterized by the merged columns map.
 *
 * @since 0.0.0
 * @category Types
 */
export type SQLiteTableWithMergedColumns<
  TableName extends string,
  TAllColumns extends Record<string, ColumnBuilderBase>,
> = sqlite.SQLiteTableWithColumns<{
  name: TableName;
  schema: undefined;
  columns: BuildColumns<TableName, TAllColumns, "sqlite">;
  dialect: "sqlite";
}>;
