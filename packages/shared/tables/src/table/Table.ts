import type { BuildColumns, ColumnBuilderBase } from "drizzle-orm";
import * as sqlite from "drizzle-orm/sqlite-core";
import type { DefaultColumnKey } from "../columns.js";
import { makeGlobalColumns } from "../common.js";
import type { EntityIdLike, EntityIdType, MergedColumns, Prettify, SQLiteTableWithMergedColumns } from "./types.js";

type NoDefaultKeys<TColumnsMap> = TColumnsMap & { readonly [K in DefaultColumnKey]?: never };

type ColumnsMap = Omit<Record<string, ColumnBuilderBase>, DefaultColumnKey>;

type TableName<TEntityId extends EntityIdLike> = TEntityId["tableName"] & string;

type ExtraConfigColumns<
  TEntityId extends EntityIdLike,
  TDefaults extends Record<string, ColumnBuilderBase>,
  TColumnsMap extends ColumnsMap,
> = BuildColumns<TableName<TEntityId>, MergedColumns<TDefaults, TColumnsMap>, "sqlite">;

type ExtraConfig<
  TEntityId extends EntityIdLike,
  TDefaults extends Record<string, ColumnBuilderBase>,
  TColumnsMap extends ColumnsMap,
> = undefined | ((self: ExtraConfigColumns<TEntityId, TDefaults, TColumnsMap>) => sqlite.SQLiteTableExtraConfigValue[]);

type AllColumns<TDefaults extends Record<string, ColumnBuilderBase>, TColumnsMap extends ColumnsMap> = Prettify<
  MergedColumns<TDefaults, TColumnsMap>
>;

const makeIdColumn = <TEntityId extends EntityIdLike>() =>
  sqlite.integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }).$type<EntityIdType<TEntityId>>();

/**
 * Create a shared SQLite table with the canonical default columns injected.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const make = <const TEntityId extends EntityIdLike>(entityId: TEntityId) => {
  const defaultColumns = {
    id: makeIdColumn<TEntityId>(),
    ...makeGlobalColumns(),
  };

  return <TColumnsMap extends ColumnsMap>(
    columns: NoDefaultKeys<TColumnsMap>,
    extraConfig?: ExtraConfig<TEntityId, typeof defaultColumns, TColumnsMap>
  ): SQLiteTableWithMergedColumns<TableName<TEntityId>, AllColumns<typeof defaultColumns, TColumnsMap>> => {
    const mergedColumns = {
      ...defaultColumns,
      ...columns,
    };

    return sqlite.sqliteTable<TableName<TEntityId>, AllColumns<typeof defaultColumns, TColumnsMap>>(
      entityId.tableName,
      mergedColumns,
      extraConfig
    );
  };
};
