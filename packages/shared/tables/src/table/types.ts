/**
 * Shared table factory types.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { BuildColumns, ColumnBuilderBase } from "drizzle-orm";
import type * as sqlite from "drizzle-orm/sqlite-core";

/**
 * Structural contract required by `Table.make`.
 *
 * The shared-domain `EntityId` schemas satisfy this shape, and tests can use
 * light-weight stand-ins without dragging domain dependencies into the tables
 * package itself.
 *
 * @example
 * ```ts
 * import type { EntityIdLike } from "@beep/shared-tables/table"
 *
 * const entityId: EntityIdLike<"UserId", "users", "shared", number> = {
 *   _tag: "UserId",
 *   slice: "shared",
 *   tableName: "users"
 * }
 *
 * void entityId
 * ```
 *
 * @since 0.0.0
 * @category types
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
 * @example
 * ```ts
 * import type { EntityIdLike, EntityIdType } from "@beep/shared-tables/table"
 *
 * type UserIdSchema = EntityIdLike<"UserId", "users", "shared", number>
 * const id: EntityIdType<UserIdSchema> = 1
 *
 * void id
 * ```
 *
 * @since 0.0.0
 * @category types
 */
export type EntityIdType<TEntityId extends EntityIdLike> = Exclude<TEntityId["Type"], undefined>;

/**
 * Merge type where the left-hand side wins on key conflicts.
 *
 * @example
 * ```ts
 * import type { ColumnBuilderBase } from "drizzle-orm"
 * import type { MergedColumns } from "@beep/shared-tables/table"
 *
 * type Columns = MergedColumns<
 *   { readonly id: ColumnBuilderBase },
 *   { readonly name: ColumnBuilderBase }
 * >
 * const readId = (columns: Columns) => columns.id
 *
 * void readId
 * ```
 *
 * @since 0.0.0
 * @category types
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
 * @example
 * ```ts
 * import type { Prettify } from "@beep/shared-tables/table"
 *
 * type Model = Prettify<{ readonly id: number }>
 * const model: Model = { id: 1 }
 *
 * void model
 * ```
 *
 * @since 0.0.0
 * @category types
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Final SQLite table type parameterized by the merged columns map.
 *
 * @example
 * ```ts
 * import type { ColumnBuilderBase } from "drizzle-orm"
 * import type { SQLiteTableWithMergedColumns } from "@beep/shared-tables/table"
 *
 * type UserTable = SQLiteTableWithMergedColumns<
 *   "users",
 *   { readonly id: ColumnBuilderBase }
 * >
 * const getTableName = (table: UserTable) => table._.name
 *
 * void getTableName
 * ```
 *
 * @since 0.0.0
 * @category types
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
