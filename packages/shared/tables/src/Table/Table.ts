import type { EntityId } from "@beep/schema/identity";
import type { DefaultColumns } from "@beep/shared-tables/columns";
import type { BuildExtraConfigColumns } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "../common";
import type { MergedColumns, PgTableWithMergedColumns, Prettify } from "./types";

type DefaultColumnKeys = keyof DefaultColumns<string, string>;

/**
 * Constraint type that produces a compile error when conflicting keys are provided.
 * Works by requiring conflicting keys to be `never`, which is unsatisfiable.
 *
 * @example
 * // This will error:
 * Table.make(SomeId)({ id: pg.text("id") })
 * // Error: Type 'PgTextBuilderInitial<...>' is not assignable to type 'never'
 */
type NoDefaultKeys<T> = T & { readonly [K in DefaultColumnKeys]?: never };

type ColumnsMap = Omit<Record<string, pg.PgColumnBuilderBase>, DefaultColumnKeys>;

type ExtraConfigColumns<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends ColumnsMap,
> = BuildExtraConfigColumns<TableName, MergedColumns<DefaultColumns<TableName, Brand>, TColumnsMap>, "pg">;

type ExtraConfig<TableName extends string, Brand extends string, TColumnsMap extends ColumnsMap> =
  | undefined
  | ((self: ExtraConfigColumns<TableName, Brand, TColumnsMap>) => PgTableExtraConfigValue[]);

/**
 * All columns (defaults + custom), flattened for clean display.
 * This is the type that will be displayed in hover tooltips.
 */
type AllColumns<TableName extends string, Brand extends string, TColumnsMap extends ColumnsMap> = Prettify<
  MergedColumns<DefaultColumns<TableName, Brand>, TColumnsMap>
>;

export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends ColumnsMap>(
  columns: NoDefaultKeys<TColumnsMap>,
  extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>>) => {
  const defaultColumns: DefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  const maker =
    (
      defaultColumns: DefaultColumns<TableName, Brand>
    ): (<TColumnsMap extends ColumnsMap>(
      columns: NoDefaultKeys<TColumnsMap>,
      extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
    ) => PgTableWithMergedColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>>) =>
    <TColumnsMap extends ColumnsMap>(
      columns: NoDefaultKeys<TColumnsMap>,
      extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
    ): PgTableWithMergedColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>> => {
      const cols = {
        ...defaultColumns,
        ...columns,
      };
      return pg.pgTable<TableName, AllColumns<TableName, Brand, TColumnsMap>>(entityId.tableName, cols, extraConfig);
    };

  return maker(defaultColumns);
};
